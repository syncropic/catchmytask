"use client";
import MonacoEditor from "@components/MonacoEditor";
import {
  DebouncedInput,
  isAllLocalDBSuccess,
  mergeEdgeWithEntityValues,
  useFetchQueryDataByState,
  useReadRecordByState,
  useTableColumns,
} from "@components/Utils";
import {
  DataDisplayComponentProps,
  ResultsComponentProps,
} from "@components/interfaces";
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

import TableView from "@components/TableView";

// A TanStack fork of Kent C. Dodds' match-sorter library that provides ranking information
import {
  RankingInfo,
  rankItem,
  compareItems,
} from "@tanstack/match-sorter-utils";
import { useEffect, useMemo, useState } from "react";
import { useElementSize } from "@mantine/hooks";
import { useAppStore } from "src/store";
import Board from "@components/Board";

import dynamic from "next/dynamic";
// import { initializeLocalDB } from "src/local_db";
import { useDuckDB } from "pages/_app";
import DataGridView from "@components/DataGridView";

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
  display,
  view_mode,
}: DataDisplayComponentProps<T>) {
  // const { ref, width } = useElementSize();
  // const [isLarge, setIsLarge] = useState(true);

  const {
    focused_entities,
    selectedRecords,
    sortedRecords,
    fields,
    setFields,
    activeView,
  } = useAppStore();

  let read_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: activeView?.id,
    record: activeView,
    read_record_mode: "remote",
  };

  const {
    data: viewData,
    isLoading: viewIsLoading,
    error: viewError,
  } = useReadRecordByState(read_record_state);

  let viewRecord = viewData?.data?.find(
    (item: any) => item?.message?.code === activeView?.id
  )?.data[0];

  const { tableColumns } = useTableColumns({
    field_configurations: data_fields?.map((nested_field: any) =>
      mergeEdgeWithEntityValues(nested_field)
    ),
    table_id: record?.id,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "priority",
      desc: true, // sort by name in descending order by default
    },
  ]);
  // const [viewAsvalue, setViewAsValue] = useState(
  //   view_data?.data[0]?.view_as ?? ""
  // );
  // const [viewAsvalue, setViewAsValue] = useState("table");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  // const [globalFilter, setGlobalFilter] = useState("");
  // const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  // const [rowSelection, setRowSelection] = useState({});

  // Memoize table data and columns to avoid unnecessary renders
  const memoizedData = useMemo(() => data_items ?? [], [data_items]);
  const memoizedColumns = useMemo(() => tableColumns ?? [], [tableColumns]);

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // onColumnVisibilityChange: setColumnVisibility,
    // onColumnVisibilityChange: handleColumnVisibilityChange,
    // onRowSelectionChange: setRowSelection,
    // onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString", //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    filterFns: {
      //add the fuzzy filter to the filter functions
      fuzzy: fuzzyFilter,
    }, //define as a filter function that can be used in column definitions
    state: {
      sorting,
      columnFilters,
      // columnVisibility,
      // rowSelection,
      // globalFilter,
    },
    initialState: {
      // columnFilters: [
      //   {
      //     id: "payment_status_comparison",
      //     value: `match`, // filter the name column by 'John' by default
      //   },
      // ],
      // sorting: [
      //   {
      //     id: "priority",
      //     desc: true, // sort by name in descending order by default
      //   },
      // ],
    },
  });

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

  // const [tableKey, setTableKey] = useState(0);

  // useEffect(() => {
  //   setTable(createTable());
  //   setTableKey(prev => prev + 1);  // Force re-render of table components
  // }, [createTable, activeView]);

  // let selected_record_items_key = `${action}_action_input_${record?.id}`;
  const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  let action_input_form_values_key = `${action}_${actionInputId}`;
  // return board for action steps by default
  if (view_mode === "board") {
    return <Board data_fields={data_items}></Board>;
  }
  if (view_mode === "json") {
    return (
      <MonacoEditor
        value={{
          data_items: data_items,
        }}
        language="json"
        height="75vh"
      />
    );
  }
  if (view_mode === "datagrid") {
    return (
      <>
        <DataGridView
          data_fields={
            sortedRecords[`${action_input_form_values_key}`]
              ? sortedRecords[`${action_input_form_values_key}`].filter(
                  (sortedRecord: any) =>
                    selectedRecords[`${action_input_form_values_key}`]?.some(
                      (selectedRecord: any) =>
                        selectedRecord.name === sortedRecord.name
                    )
                )
              : selectedRecords[`${action_input_form_values_key}`] ||
                data_fields
          }
          // tableInstance={table}
          // resource_group={
          //   record?.success_message_code || record?.entity_type || entity_type
          // }
          data_items={data_items}
          // setSorting={setSorting}
          // sorting={sorting}
          view_record={viewRecord}
          // ui={ui || {}}
        />
      </>
    );
  }
  // default return table view
  return (
    <>
      {/* <MonacoEditor
        value={{
          data_items: data_items,
          data_fieds: sortedRecords[`${action_input_form_values_key}`]
            ? sortedRecords[`${action_input_form_values_key}`].filter(
                (sortedRecord: any) =>
                  selectedRecords[`${action_input_form_values_key}`]?.some(
                    (selectedRecord: any) =>
                      selectedRecord.name === sortedRecord.name
                  )
              )
            : selectedRecords[`${action_input_form_values_key}`] || data_fields,
          records: table.getSortedRowModel().rows.map((row) => row.original),
        }}
        language="json"
        height="75vh"
      /> */}
      <MonacoEditor
        value={{
          data_items: data_items,
        }}
        language="json"
        height="75vh"
      />
      {/* <TableView
        isLoadingDataItems={isLoadingDataItems ?? false}
        data_fields={
          sortedRecords[`${action_input_form_values_key}`]
            ? sortedRecords[`${action_input_form_values_key}`].filter(
                (sortedRecord: any) =>
                  selectedRecords[`${action_input_form_values_key}`]?.some(
                    (selectedRecord: any) =>
                      selectedRecord.name === sortedRecord.name
                  )
              )
            : selectedRecords[`${action_input_form_values_key}`] || data_fields
        }
        tableInstance={table}
        resource_group={
          record?.success_message_code || record?.entity_type || entity_type
        }
        setSorting={setSorting}
        sorting={sorting}
        ui={ui || {}}
      /> */}
    </>
  );
}

export default DataDisplay;
