import React, { useEffect, useRef, useState } from "react";
import {
  ReactGrid,
  CellChange,
  Row,
  TextCell,
  Column,
  Id,
  MenuOption,
  SelectionMode,
  CellLocation,
} from "@silevis/reactgrid";
import { ConditionallyFormattedCellTemplate } from "./ConditionallyFormattedCellTemplate";
import { useGridData } from "./useGridData";
import { DetailCellTemplate } from "./DetailCellTemplate";
import { useAppStore } from "src/store";
import { useIsMobile } from "@components/Utils";

interface ResultsComponentProps {
  data_fields: any[];
  data_items: any[];
  view_record: any;
  onDataChange?: (
    updatedData: any[],
    changedRows: any[],
    changedFields?: Record<number, string[]>
  ) => void; // Updated to include changed rows and columns
}

const applyChangesToData = (
  changes: CellChange[],
  prevData: any[],
  modifiedRowIds: Set<number>,
  modifiedFields: Record<number, Set<string>>
): any[] => {
  changes.forEach((change) => {
    const dataIndex = Number(change.rowId);
    const fieldName = change.columnId as string;

    // Only update if it's a text cell change and the index exists
    if (
      "text" in change.newCell &&
      dataIndex >= 0 &&
      dataIndex < prevData.length
    ) {
      prevData[dataIndex][fieldName] = change.newCell.text;

      // Track which row was modified
      modifiedRowIds.add(dataIndex);

      // Track which field was modified in this row
      if (!modifiedFields[dataIndex]) {
        modifiedFields[dataIndex] = new Set<string>();
      }
      modifiedFields[dataIndex].add(fieldName);
    }
  });
  return [...prevData];
};

export function DataGridView({
  data_fields,
  data_items,
  view_record,
  onDataChange,
}: ResultsComponentProps) {
  const [localData, setLocalData] = useState(data_items);

  // Set to track which row IDs have been modified
  const [modifiedRowIds, setModifiedRowIds] = useState<Set<number>>(new Set());

  // Object to track which columns were modified for each row
  // Key is row index, value is a Set of column IDs that were changed
  const [modifiedFields, setModifiedFields] = useState<
    Record<number, Set<string>>
  >({});

  // Update local data when props change
  useEffect(() => {
    setLocalData(data_items);
    // Reset modified rows tracking when data refreshes
    setModifiedRowIds(new Set());
    setModifiedFields({});
  }, [data_items]);

  const isMobile = useIsMobile();

  const { rows, columns, handleColumnResize } = useGridData(
    localData,
    data_fields,
    view_record
  );
  const { setActiveRecord } = useAppStore();

  const handleChanges = (changes: CellChange[]) => {
    // Create a new Set with current modified row IDs
    const updatedModifiedRowIds = new Set(modifiedRowIds);

    // Create a copy of the current modified fields tracking
    const updatedModifiedFields = { ...modifiedFields };

    // Apply changes and track modified rows and fields
    const updatedData = applyChangesToData(
      changes,
      [...localData],
      updatedModifiedRowIds,
      updatedModifiedFields
    );

    // Update local state
    setLocalData(updatedData);
    setModifiedRowIds(updatedModifiedRowIds);
    setModifiedFields(updatedModifiedFields);

    // Get only the modified rows data
    const changedRowsData = Array.from(updatedModifiedRowIds).map(
      (rowId) => updatedData[rowId]
    );

    // Convert Sets of changed columns to arrays for API consumption
    const changedFieldsForApi: Record<number, string[]> = {};
    Object.keys(updatedModifiedFields).forEach((rowId) => {
      const numericRowId = Number(rowId);
      changedFieldsForApi[numericRowId] = Array.from(
        updatedModifiedFields[numericRowId]
      );
    });

    // Notify parent component of the change
    if (onDataChange) {
      onDataChange(updatedData, changedRowsData, changedFieldsForApi);
    }
  };

  // Function to get only modified rows with their changed fields for API submission
  const getModifiedRowsWithFields = () => {
    const result: {
      rowData: any;
      changedFields: string[];
      // Alternatively, you could include only the changed fields
      changedValues: Record<string, any>;
    }[] = [];

    modifiedRowIds.forEach((rowId) => {
      // Get the full row data
      const rowData = { ...localData[rowId] };

      // Add metadata about which fields were changed
      const changedFields = modifiedFields[rowId]
        ? Array.from(modifiedFields[rowId])
        : [];

      // You can either include the whole row with metadata about changed fields
      result.push({
        rowData,
        changedFields,
        // Alternatively, you could include only the changed fields
        changedValues: changedFields.reduce((obj, field) => {
          obj[field] = rowData[field];
          return obj;
        }, {} as Record<string, any>),
      });
    });

    return result;
  };

  // Function to submit only changed rows to API
  const submitChangesToApi = async () => {
    const changedRowsWithFields = getModifiedRowsWithFields();

    if (changedRowsWithFields.length > 0) {
      try {
        // Example API call - replace with your actual implementation
        // await apiService.updateRecords(changedRowsWithFields);
        console.log("Submitting changed data to API:", changedRowsWithFields);

        // Reset tracking after successful submission
        setModifiedRowIds(new Set());
        setModifiedFields({});
      } catch (error) {
        console.error("Failed to submit changes:", error);
      }
    }
  };

  const handleContextMenu = (
    selectedRowIds: Id[],
    selectedColIds: Id[],
    selectionMode: SelectionMode,
    menuOptions: MenuOption[]
  ): MenuOption[] => {
    if (selectionMode === "row") {
      menuOptions = [
        ...menuOptions,
        {
          id: "removeRecord",
          label: "Remove Record",
          handler: () => {
            setLocalData((prevData) => {
              const newData = [
                ...prevData.filter(
                  (record, idx) => !selectedRowIds.includes(idx)
                ),
              ];

              // Track row removal as a change
              selectedRowIds.forEach((id) => {
                modifiedRowIds.add(Number(id));
              });

              return newData;
            });
          },
        },
        // Add a context menu option to save changes
        {
          id: "saveChanges",
          label: "Save Changes",
          handler: submitChangesToApi,
        },
      ];
    }
    return menuOptions;
  };

  const handleFocusLocationChanged = (location: CellLocation) => {
    const dataIndex = Number(location.rowId);
    const fieldName = location.columnId;
    console.log(location);
    const data = localData[dataIndex];
    let data_object = Object.assign({}, data);
    setActiveRecord(data_object);
  };

  return (
    <div className={`overflow-scroll ${!isMobile ? "h-3/4" : ""}`}>
      {/* Optional: Add a button to submit changes */}
      {/* {modifiedRowIds.size > 0 && (
        <div className="flex gap-2 mb-2">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={submitChangesToApi}
          >
            Save Changes ({modifiedRowIds.size} rows modified)
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded"
            onClick={() => {
              console.log(
                "Modified data details:",
                Array.from(modifiedRowIds).map((rowId) => ({
                  rowId,
                  data: localData[rowId],
                  changedFields: modifiedFields[rowId]
                    ? Array.from(modifiedFields[rowId])
                    : [],
                }))
              );
            }}
          >
            Debug Changes
          </button>
        </div>
      )} */}

      {rows.length > 0 && columns?.length > 0 && (
        <ReactGrid
          rows={rows}
          columns={columns}
          stickyLeftColumns={2}
          stickyRightColumns={1}
          stickyTopRows={1}
          enableRowSelection={true}
          enableColumnSelection={true}
          enableRangeSelection={true}
          enableFillHandle={true}
          onColumnResized={handleColumnResize}
          customCellTemplates={{
            detail: new DetailCellTemplate(),
            conditionallyformatted: new ConditionallyFormattedCellTemplate(),
          }}
          onCellsChanged={handleChanges}
          onContextMenu={handleContextMenu}
          onFocusLocationChanged={handleFocusLocationChanged}
        />
      )}
    </div>
  );
}

export default DataGridView;
