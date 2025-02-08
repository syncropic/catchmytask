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
  onDataChange?: (updatedData: any[]) => void; // New prop for handling data updates
}

const applyChangesToData = (changes: CellChange[], prevData: any[]): any[] => {
  changes.forEach((change) => {
    // Skip header row (rowId === 0)
    // if (Number(change.rowId) === 0) return;

    // // Get the actual data index (subtract 1 to account for header row)
    // const dataIndex = Number(change.rowId) - 1;
    // const fieldName = change.columnId;
    const dataIndex = Number(change.rowId);
    const fieldName = change.columnId;

    // Only update if it's a text cell change and the index exists
    if (
      "text" in change.newCell &&
      dataIndex >= 0 &&
      dataIndex < prevData.length
    ) {
      prevData[dataIndex][fieldName] = change.newCell.text;
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

  // Update local data when props change
  useEffect(() => {
    setLocalData(data_items);
  }, [data_items]);
  const isMobile = useIsMobile(); // Custom hook to check if the screen is mobile

  const { rows, columns, handleColumnResize } = useGridData(
    localData,
    data_fields,
    view_record
  );
  const { setActiveRecord } = useAppStore();

  const handleChanges = (changes: CellChange[]) => {
    // const updatedData = [...localData];

    const updatedData = applyChangesToData(changes, localData);

    // Update local state
    setLocalData(updatedData);
    // console.log("updatedData", updatedData);

    // Notify parent component of the change
    if (onDataChange) {
      onDataChange(updatedData);
    }
  };

  // const simpleHandleContextMenu = (
  //   selectedRowIds: Id[],
  //   selectedColIds: Id[],
  //   selectionMode: SelectionMode,
  //   menuOptions: MenuOption[],
  //   selectedRanges: Array<CellLocation[]>
  // ): MenuOption[] => {
  //   return menuOptions;
  // };
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
              return [
                ...prevData.filter(
                  (record, idx) => !selectedRowIds.includes(idx)
                ),
              ];
            });
          },
        },
      ];
    }
    return menuOptions;
  };

  // const handleFocusLocationChanged = (location: CellLocation) => {
  //   const dataIndex = location.rowId as string;
  //   const fieldName = location.columnId;
  //   console.log(location);
  //   const data = localData[dataIndex];
  //   let data_object = Object.assign({}, data);
  //   // console.log(data_object);
  //   setActiveRecord(data_object);
  // };

  const handleFocusLocationChanged = (location: CellLocation) => {
    const dataIndex = Number(location.rowId); // Convert string to number
    const fieldName = location.columnId;
    console.log(location);
    const data = localData[dataIndex];
    let data_object = Object.assign({}, data);
    setActiveRecord(data_object);
  };

  return (
    // <div className="h-[75vh] overflow-scroll">
    <div className={`overflow-scroll ${!isMobile ? "h-3/4" : ""}`}>
      {/* {JSON.stringify(data_items)} */}
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
          // enableFullWidthHeader={true}
          onFocusLocationChanged={handleFocusLocationChanged}
          // horizontalStickyBreakpoint={40}
          // verticalStickyBreakpoint={40}
        />
      )}
    </div>
  );
}

export default DataGridView;
