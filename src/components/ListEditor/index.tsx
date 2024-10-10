"use client";
import MonacoEditor from "@components/MonacoEditor";
import {
  DebouncedInput,
  mergeEdgeWithEntityValues,
  useTableColumns,
} from "@components/Utils";
import {
  DataDisplayComponentProps,
  ResultsComponentProps,
} from "@components/interfaces";
import { aggregate_views, views } from "@data/index";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator
// import _, { set } from "lodash";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingFn,
  SortingState,
  useReactTable,
  FilterFn,
  sortingFns,
  Column,
} from "@tanstack/react-table";
import * as React from "react";
import {
  ColumnFiltersState,
  VisibilityState,
  getFilteredRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

// import { Button } from "@components/Button";
import { Checkbox } from "@components/Checkbox";

// import { Input } from "@components/Input";
import Reveal from "@components/Reveal";
import ActivateActionsSelection from "@components/ActivateActionsSelection";
import TableView from "@components/TableView";
import SpreadsheetView from "@components/SpreadsheetView";
import SelectViewAs from "@components/SelectViewAs";
import { getColumnIdWithoutResourceGroup } from "src/utils";

// A TanStack fork of Kent C. Dodds' match-sorter library that provides ranking information
import {
  RankingInfo,
  rankItem,
  compareItems,
} from "@tanstack/match-sorter-utils";
import { useEffect, useState } from "react";
import { useElementSize } from "@mantine/hooks";
import ActionInputWrapper from "@components/ActionInput";
import { useAppStore } from "src/store";
import RecordsActionWrapper from "@components/RecordsAction";
import Board from "@components/Board";
import {
  DragDropContext,
  Draggable,
  type DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { Box, Button, TableTd } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconGripVertical } from "@tabler/icons-react";
import {
  DataTable,
  DataTableColumn,
  DataTableDraggableRow,
} from "mantine-datatable";
import companies from "./companies.json";
import RecordActionsWrapper from "@components/RecordActions";

declare module "@tanstack/react-table" {
  //add fuzzy filter to the filterFns
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

// Define a custom fuzzy filter function that will apply ranking info to rows (using match-sorter utils)
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

// Define a custom fuzzy sort function that will sort by rank if the row has ranking information
// const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
//   let dir = 0;

//   // Only sort by rank if the column has ranking information
//   if (rowA.columnFiltersMeta[columnId]) {
//     dir = compareItems(
//       rowA.columnFiltersMeta[columnId]?.itemRank!,
//       rowB.columnFiltersMeta[columnId]?.itemRank!
//     );
//   }

//   // Provide an alphanumeric fallback for when the item ranks are equal
//   return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
// };

export interface RowData {
  [key: string]: any;
}
const PAGE_SIZES = [10, 15, 20];

export function DataDisplay<T extends Record<string, any>>({
  display_mode,
  data_items,
  data_fields,
  record,
  isLoadingDataItems,
  entity_type,
  ui,
}: // isLoadingDataItems,
// resource_group,
// execlude_components,
// name,
// read_write_mode,
// ui,
// invalidate_queries_on_submit_success,
DataDisplayComponentProps<T>) {
  // const { ref, width } = useElementSize();
  // const [isLarge, setIsLarge] = useState(true);
  const { focused_entities } = useAppStore();
  // const { tableColumns } = useTableColumns({
  //   field_configurations: view_data?.data[0]?.field_configurations?.map(
  //     (nested_field: any) => mergeEdgeWithEntityValues(nested_field)
  //   ),
  //   table_id: resource_group,
  // });
  const { tableColumns } = useTableColumns({
    field_configurations: data_fields?.map((nested_field: any) =>
      mergeEdgeWithEntityValues(nested_field)
    ),
    table_id: record?.id,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  // const [viewAsvalue, setViewAsValue] = useState(
  //   view_data?.data[0]?.view_as ?? ""
  // );
  // const [viewAsvalue, setViewAsValue] = useState("table");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  // let view_data_visible_fields =
  //   view_data?.data[0]?.visible_fields?.map(
  //     (item: any) => `${resource_group}-${item}`
  //   ) ?? [];
  // const [visibleFields, setVisibleFields] = useState<string[]>(
  //   view_data_visible_fields
  // ); // List to store initial visible columns

  // Function to initialize column visibility based on visibleFields
  // useEffect(() => {
  //   const initialVisibility: VisibilityState = {};
  //   // if data_columns is not in visible fields, set it to false
  //   data_columns.forEach((column) => {
  //     initialVisibility[`${column.id}`] = visibleFields.includes(
  //       column?.id ?? ""
  //     );
  //   });

  //   setColumnVisibility(initialVisibility);
  // }, [visibleFields, resource_group]);

  const table = useReactTable({
    data: data_items ?? [],
    columns: tableColumns ?? [],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    // onColumnVisibilityChange: handleColumnVisibilityChange,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "fuzzy", //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    filterFns: {
      fuzzy: fuzzyFilter, //define as a filter function that can be used in column definitions
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    // initialState: {
    //   columnFilters: [
    //     {
    //       id: 'name',
    //       value: 'John', // filter the name column by 'John' by default
    //     },
    //   ],
    // },
  });

  // useEffect(() => {
  //   setIsLarge(width >= 700);
  // }, [width]);

  // const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);

  // useEffect(() => {
  //   setPage(1);
  // }, [pageSize]);

  // const [page, setPage] = useState(1);
  // const [records, setRecords] = useState(data_items.slice(0, pageSize));

  // useEffect(() => {
  //   const from = (page - 1) * pageSize;
  //   const to = from + pageSize;
  //   setRecords(data_items.slice(from, to));
  // }, [page, pageSize]);

  return (
    <>
      <div className="w-full">
        {/* <div>{JSON.stringify(data_items)}</div> */}
        {/* <div>{JSON.stringify(entity_type)}</div> */}
        {/* <div>{JSON.stringify(record)}</div> */}
        {/* <div>{JSON.stringify(table?.getAllColumns())}</div> */}
        {/* <div>{width}</div> */}
        {/* <div>{JSON.stringify(isLarge)}</div> */}
        {/* {JSON.stringify(table.getVisibleFlatColumns().map((column) => column))} */}
        {/* {JSON.stringify(focused_entities[record?.id]?.["display_mode"])} */}
        {focused_entities[record?.id]?.["display_mode"]?.name === "board" ||
          (entity_type === "action_steps" && (
            <Board data_fields={data_items}></Board>
          ))}
        {focused_entities[record?.id]?.["display_mode"]?.name === "table" && (
          <TableView
            data_items={data_items}
            isLoadingDataItems={isLoadingDataItems ?? false}
            data_fields={data_fields}
            tableInstance={table}
            resource_group={record?.entity_type || entity_type}
            ui={ui || {}}
            //  execlude_components={execlude_components}
            //  invalidate_queries_on_submit_success={
            //    invalidate_queries_on_submit_success
            //  }
            // view_data={view_data}
          />
        )}

        {focused_entities[record?.id]?.["display_mode"]?.name === "json" && (
          <MonacoEditor
            value={table?.getFilteredRowModel().rows.map((row) => row.original)}
            language="json"
            height="100vh"
          />
        )}
      </div>
    </>
  );
}

export default DataDisplay;

interface RecordData {
  id: string;
  name: string;
  execution_order: number;
  // streetAddress: string;
  // city: string;
  // state: string;
  // missionStatement: string;
}
export const ListEditorFormInput = ({ ...props }: any) => {
  // const transformedRecords = props?.value?.map((item: string, index: any) => ({
  //   id: uuidv4(), // Generate a unique ID for each item
  //   description: item,
  //   index: index + 1,
  // }));

  // // Set transformed records as the initial state
  // const [records, setRecords] = useState<RecordData[]>(transformedRecords);
  // const { selectedRecords, setSelectedRecords } = useAppStore();

  const [records, setRecords] = useState<RecordData[]>([]); // Initialize with an empty array
  const { selectedRecords, setSelectedRecords } = useAppStore();

  // Update records whenever props.value changes
  // for id use the item with all spaces replaced with _
  useEffect(() => {
    if (props.value && props.value.length > 0) {
      const transformedRecords = props.value.map((item: any) => ({
        ...item,
        id: item?.name.replace(/ /g, "_"),
      }));
      setRecords(transformedRecords); // Update state with transformed records
      // console.log("transformedRecords", transformedRecords);
    }
  }, [props.value]); // Dependency array ensures effect runs when props.value changes

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(records);
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const [reorderedItem] = items.splice(sourceIndex, 1);
    items.splice(destinationIndex, 0, reorderedItem);

    let items_with_index = items.map((item, index) => {
      return { ...item, index: item?.execution_order };
    });
    setRecords(items_with_index);
    // notifications.show({
    //   title: "Table reordered",
    //   message: `The company named "${
    //     items[sourceIndex].name
    //   }" has been moved from position ${sourceIndex + 1} to ${
    //     destinationIndex + 1
    //   }.`,
    //   color: "blue",
    // });
  };

  const handleSelectValue = (value: any) => {
    // console.log("selected value", value);
    let new_selected_records = {
      ...selectedRecords,
      [`${props?.action_input_form_values_key}`]: value,
    };
    setSelectedRecords(new_selected_records);
  };
  const handleClearFields = () => {
    let new_selected_records = {
      ...selectedRecords,
      [`${props?.action_input_form_values_key}`]: [],
    };
    setSelectedRecords({});
  };

  const columns: DataTableColumn<RecordData>[] = [
    // add empty header column for the drag handle
    { accessor: "", hiddenContent: true, width: 50 },
    { accessor: "name" },
    { accessor: "execution_order", width: 80 },
    // { accessor: "streetAddress", width: 150 },
    // { accessor: "city", width: 150 },
    // { accessor: "state", width: 150 },
  ];
  return (
    <>
      <div className="p-1">
        <Button size="compact-xs" onClick={handleClearFields}>
          clear
        </Button>
      </div>
      {/* {props?.schema?.title && (
        <Text fw={500} size="sm">
          {props?.schema?.title}
        </Text>
      )} */}
      {/* <div>{JSON.stringify(selectedRecords)}</div> */}
      {/* <div>{JSON.stringify(props?.action_input_form_values_key)}</div> */}
      {/* <div>list editor</div> */}
      {/* <div>{JSON.stringify(props?.value)}</div> */}
      {/* {props?.value && (
        <NaturalLanguageEditor
          // {...props?.schema}
          // value={props?.value}
          value={JSON.stringify(props?.value)}
          setValue={props?.onChange}
          form={props?.form}
          isLoading={props?.isLoading}
          // field={props?.schema.title.toLowerCase().replace(/ /g, "_")}
          // {...props}
        />
      )} */}
      {props?.value && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <DataTable<RecordData>
            columns={[
              ...columns,
              // {
              //   accessor: "actions",
              //   title: <Box mr={6}>actions</Box>,
              //   textAlign: "right",
              //   width: 80,
              //   render: (record: any) => (
              //     // <div>record actions</div>
              //     <RecordActionsWrapper
              //       record={record}
              //       name="action_step"
              //       query_name="data_model"
              //       success_message_code="action_input_data_model_schema"
              //     ></RecordActionsWrapper>
              //   ),
              // },
            ]}
            records={records}
            withTableBorder
            withColumnBorders
            tableWrapper={({ children }) => (
              <Droppable droppableId="datatable">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {children}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
            styles={{ table: { tableLayout: "fixed" } }}
            selectedRecords={
              selectedRecords[`${props?.action_input_form_values_key}`] ?? []
            }
            onSelectedRecordsChange={handleSelectValue}
            rowFactory={({
              record,
              index,
              rowProps,
              children,
            }: {
              record: RecordData;
              index: number;
              rowProps: any;
              children: React.ReactNode;
            }) => (
              <Draggable key={record.id} draggableId={record.id} index={index}>
                {(provided, snapshot) => (
                  <DataTableDraggableRow
                    isDragging={snapshot.isDragging}
                    {...rowProps}
                    {...provided.draggableProps}
                  >
                    <TableTd
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                    >
                      <IconGripVertical size={12} />
                    </TableTd>
                    {children}
                  </DataTableDraggableRow>
                )}
              </Draggable>
            )}
          />
        </DragDropContext>
      )}
      {/* <MonacoEditor value={props?.value} language="json" height="100vh" /> */}
    </>
    // <div>monaco editor form input</div>
  );
};
