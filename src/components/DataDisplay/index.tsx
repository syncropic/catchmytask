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
import {
  ActionIcon,
  Switch,
  TextInput,
  Tooltip,
  Input,
  rem,
  Button,
  Tabs,
  Text,
} from "@mantine/core";
import {
  IconCode,
  IconColumns,
  IconDatabase,
  IconDownload,
  IconEye,
  IconFileDownload,
  IconLink,
  IconPlayerPlay,
  IconCircleX,
  IconZoomCode,
  IconShare,
} from "@tabler/icons-react";
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
  action = "set_fields",
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
  const { focused_entities, selectedRecords, fields, setFields } =
    useAppStore();
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

  useEffect(() => {
    if (data_fields && record?.id) {
      // Create the new fields object
      const new_fields = {
        ...fields,
        [record.id]: data_fields,
      };

      // Check if the new fields are different from the current fields
      const fieldsChanged =
        JSON.stringify(fields[record.id]) !== JSON.stringify(data_fields);

      if (fieldsChanged) {
        setFields(new_fields);
      }
    }
  }, [data_fields, record?.id, fields, setFields]);

  // let selected_record_items_key = `${action}_action_input_${record?.id}`;
  const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  const action_input_form_values_key = `action_input_${actionInputId}`;

  return (
    <>
      <div className="w-full">
        {/* <MonacoEditor
          value={table?.getFilteredRowModel().rows.map((row) => row.original)}
          language="json"
          height="100vh"
        /> */}
        {/* <div>{JSON.stringify(record?.id)}</div> */}

        {/* <div>{JSON.stringify(data_items)}</div>
        <div>{JSON.stringify(entity_type)}</div> */}
        {/* <div>{JSON.stringify(action_input_form_values_key)}</div> */}

        {/* <div>{JSON.stringify(record)}</div> */}
        {/* <div>{JSON.stringify(table?.getAllColumns())}</div> */}
        {/* <div>{width}</div> */}
        {/* <div>{JSON.stringify(isLarge)}</div> */}
        {/* {JSON.stringify(table.getVisibleFlatColumns().map((column) => column))} */}
        {/* {JSON.stringify(focused_entities[record?.id]?.["display_mode"])} */}
        {focused_entities[record?.id]?.["display_mode"]?.name === "board" ||
          (entity_type === "action_steps" && (
            <Board
              data_fields={
                data_items?.filter(
                  (item) =>
                    item &&
                    selectedRecords[`${action_input_form_values_key}`]?.some(
                      (record: any) => record.name === item.name
                    )
                ) ?? []
              }
            ></Board>
          ))}

        {focused_entities[record?.id]?.["display_mode"]?.name !== "board" &&
          entity_type !== "action_steps" && (
            <TableView
              data_items={data_items ?? []}
              isLoadingDataItems={isLoadingDataItems ?? false}
              data_fields={
                selectedRecords[`${action_input_form_values_key}`] ?? []
              }
              tableInstance={table}
              resource_group={record?.entity_type || entity_type}
              ui={ui || {}}
            />
            // <div>
            //   {JSON.stringify(
            //     selectedRecords[`${action}_action_input_${record?.id}`]
            //   )}
            // </div>
            // <div>{JSON.stringify(data_fields)}</div>
          )}

        {/* {focused_entities[record?.id]?.["display_mode"]?.name === "json" && (
          <MonacoEditor
            value={table?.getFilteredRowModel().rows.map((row) => row.original)}
            language="json"
            height="100vh"
          />
        )} */}
      </div>
    </>
  );
}

export default DataDisplay;
