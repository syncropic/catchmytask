"use client";
import MonacoEditor from "@components/MonacoEditor";
import { mergeEdgeWithEntityValues, useTableColumns } from "@components/Utils";
import { useQueryClient } from "@tanstack/react-query";
// import ViewActionHistory from "@components/ViewActionHistory";
import { ResultsComponentProps } from "@components/interfaces";
import { aggregate_views, views } from "@data/index";
import { ActionIcon, Tooltip, rem } from "@mantine/core";
import { IconColumns, IconEye } from "@tabler/icons-react";
import _, { set } from "lodash";
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

import { Button } from "@components/Button";
import { Checkbox } from "@components/Checkbox";

import { Input } from "@components/Input";
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
import ConversationView from "@components/ConversationView";
import { useElementSize } from "@mantine/hooks";

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
const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  let dir = 0;

  // Only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]?.itemRank!,
      rowB.columnFiltersMeta[columnId]?.itemRank!
    );
  }

  // Provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export interface RowData {
  [key: string]: any;
}

export function Results<T extends Record<string, any>>({
  data_items,
  data_columns,
  isLoadingDataItems,
  results,
  resource_group,
  view_data,
}: ResultsComponentProps<T>) {
  const { ref, width } = useElementSize();
  const [isLarge, setIsLarge] = useState(true);
  const { tableColumns } = useTableColumns({
    field_configurations: view_data?.data[0]?.field_configurations?.map(
      (nested_field: any) => mergeEdgeWithEntityValues(nested_field)
    ),
    table_id: resource_group,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [viewAsvalue, setViewAsValue] = useState(
    view_data?.data[0]?.view_as ?? ""
  );
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  let view_data_visible_fields =
    view_data?.data[0]?.visible_fields?.map(
      (item: any) => `${resource_group}-${item}`
    ) ?? [];
  const [visibleFields, setVisibleFields] = useState<string[]>(
    view_data_visible_fields
  ); // List to store initial visible columns

  // Function to initialize column visibility based on visibleFields
  useEffect(() => {
    const initialVisibility: VisibilityState = {};
    // if data_columns is not in visible fields, set it to false
    data_columns.forEach((column) => {
      initialVisibility[`${column.id}`] = visibleFields.includes(column.id);
    });

    // console.log("data_columns", data_columns);
    // console.log("initialVisibility", initialVisibility);
    // visibleFields.forEach((field) => {
    //   initialVisibility[`${resource_group}-${field}`] = false;
    // });
    setColumnVisibility(initialVisibility);
  }, [visibleFields, resource_group]);

  // Function to update visibleFields list when column visibility changes
  // const handleColumnVisibilityChange = (
  //   updaterOrValue:
  //     | VisibilityState
  //     | ((old: VisibilityState) => VisibilityState)
  // ) => {
  //   setColumnVisibility((oldVisibility) => {
  //     const newVisibility =
  //       typeof updaterOrValue === "function"
  //         ? updaterOrValue(oldVisibility)
  //         : updaterOrValue;
  //     const newVisibleFields = Object.keys(newVisibility)
  //       .filter((key) => newVisibility[key])
  //       .map((key) => getColumnIdWithoutResourceGroup(key, resource_group));
  //     setVisibleFields(newVisibleFields);
  //     return newVisibility;
  //   });
  //   // Here you would add logic to store this state remotely
  // };

  // console.log("columnVisibility", columnVisibility);

  const table = useReactTable({
    data: data_items,
    columns: tableColumns,
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

  // console.log("custom_columns", custom_columns);
  // console.log("data_columns", data_columns);
  // console.log("view_data", view_data?.data[0]);
  // console.log(table.getState().columnFilters) // access the column filters state from the table instance
  // console.log("columnFilters", columnFilters);
  // let visibleColumns = table?.getVisibleFlatColumns() ?? [];
  // console.log("data_items", data_items);
  // console.log("tableColumns", tableColumns);
  // console.log(
  //   "visibleColumns",
  //   visibleColumns.map((column) => column.getCanFilter())
  // );

  // console log all visible columns
  // console.log("table visible columns", table?.getVisibleFlatColumns());
  // console.log("data_items", data_items);

  useEffect(() => {
    setIsLarge(width >= 700);
  }, [width]);

  return (
    <>
      <div className="w-full">
        {/* <div>{width}</div> */}
        {/* <div>{JSON.stringify(isLarge)}</div> */}
        {/* {JSON.stringify(table.getVisibleFlatColumns().map((column) => column))} */}
        <div
          ref={ref}
          className={`flex ${
            isLarge ? "flex-row" : "flex-col"
          } py-1 gap-1 justify-between items-center`}
        >
          {/* Row 1: Debounced Input */}
          <div className={`w-full ${isLarge ? "lg:w-auto" : "mb-4"}`}>
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
              className="w-full p-2 font-lg shadow border border-block"
              placeholder="Search all columns..."
            />
          </div>

          {/* Row 2: Other Elements */}
          <div
            className={`flex ${
              isLarge ? "flex-row" : "flex-row"
            } w-full lg:w-auto gap-3`}
          >
            <div>
              <ActivateActionsSelection
                record={{}}
                resultsSection={results}
              ></ActivateActionsSelection>
            </div>
            <div>
              <Reveal
                target={
                  <Tooltip label="Toggle and/or sort custom views">
                    <ActionIcon aria-label="Settings">
                      <IconEye />
                    </ActionIcon>
                  </Tooltip>
                }
                trigger="click"
              >
                {aggregate_views.map((item) => (
                  <div className="flex items-center" key={item.value}>
                    <Checkbox id={item.value} checked={item.visible} />
                    <label
                      htmlFor={item.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item.label}
                    </label>
                  </div>
                ))}
              </Reveal>
            </div>
            <div>
              <Reveal
                target={
                  <Tooltip label="Toggle and/or order columns/fields">
                    <ActionIcon aria-label="Settings">
                      <IconColumns />
                    </ActionIcon>
                  </Tooltip>
                }
                trigger="click"
              >
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <div
                      className="flex items-center space-x-2 p-1"
                      key={column.id}
                    >
                      <Checkbox
                        id={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      />
                      <label
                        htmlFor={column.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {getColumnIdWithoutResourceGroup(
                          column.id,
                          resource_group
                        )}
                      </label>
                    </div>
                  ))}
              </Reveal>
            </div>

            <div>
              <SelectViewAs
                viewAsValue={viewAsvalue}
                setViewAsValue={setViewAsValue}
              ></SelectViewAs>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        {/* loop through through included custom views */}
        {(viewAsvalue === "" || viewAsvalue === "table") && (
          <TableView
            data_items={data_items}
            isLoadingDataItems={isLoadingDataItems ?? false}
            data_columns={data_columns}
            tableInstance={table}
            resource_group={resource_group}
            view_data={view_data}
          />
        )}
        {viewAsvalue === "conversation" && (
          <ConversationView
            data_items={data_items}
            isLoadingDataItems={isLoadingDataItems ?? false}
            data_columns={data_columns}
            tableInstance={table}
            resource_group={resource_group}
            view_data={view_data}
          />
        )}
        {viewAsvalue === "json" && (
          <MonacoEditor
            value={table?.getFilteredRowModel().rows.map((row) => row.original)}
            language="json"
            height="100vh"
          />
        )}
        {viewAsvalue === "code_editor" && (
          <MonacoEditor
            value={table?.getFilteredRowModel().rows.map((row) => row.original)}
            language="json"
            height="100vh"
          />
        )}
        {viewAsvalue === "text_editor" && (
          <MonacoEditor
            value={table?.getFilteredRowModel().rows.map((row) => row.original)}
            language="json"
            height="100vh"
          />
        )}
        {viewAsvalue === "application_embeds" && <div>coming soon...</div>}
        {viewAsvalue === "spreadsheet" && (
          <SpreadsheetView
            data_items={table
              ?.getFilteredRowModel()
              .rows.map((row) => row.original)}
            isLoadingDataItems={isLoadingDataItems ?? false}
            data_columns={data_columns}
            tableInstance={table}
            resource_group={resource_group}
            view_data={view_data}
          ></SpreadsheetView>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </>
  );
}

export default Results;

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();

  return (
    <DebouncedInput
      type="text"
      value={(columnFilterValue ?? "") as string}
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      className="w-36 border shadow rounded"
    />
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
