"use client";
import MonacoEditor from "@components/MonacoEditor";
import {
  DebouncedInput,
  mergeEdgeWithEntityValues,
  useTableColumns,
} from "@components/Utils";
import { ResultsComponentProps } from "@components/interfaces";
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
} from "@mantine/core";
import {
  IconColumns,
  IconDatabase,
  IconDownload,
  IconEye,
  IconFileDownload,
  IconLink,
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
import ConversationView from "@components/ConversationView";
import { useElementSize } from "@mantine/hooks";
import ActionInputWrapper from "@components/ActionInput";

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

export function DataDisplay<T extends Record<string, any>>({
  data_items,
  data_fields,
  isLoadingDataItems,
  resource_group,
  execlude_components,
  name,
  read_write_mode,
  ui,
}: ResultsComponentProps<T>) {
  const { ref, width } = useElementSize();
  const [isLarge, setIsLarge] = useState(true);
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
    table_id: resource_group,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  // const [viewAsvalue, setViewAsValue] = useState(
  //   view_data?.data[0]?.view_as ?? ""
  // );
  const [viewAsvalue, setViewAsValue] = useState("table");
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

  useEffect(() => {
    setIsLarge(width >= 700);
  }, [width]);

  return (
    <>
      <div className="w-full">
        {/* <div>{JSON.stringify(data_items)}</div> */}
        {/* <div>{JSON.stringify(table?.getAllColumns())}</div> */}
        {/* <div>{width}</div> */}
        {/* <div>{JSON.stringify(isLarge)}</div> */}
        {/* {JSON.stringify(table.getVisibleFlatColumns().map((column) => column))} */}
        <div
          ref={ref}
          className={`flex p-3 ${
            isLarge ? "flex-row" : "flex-col"
          } py-1 gap-1 justify-between items-center`}
        >
          <div>
            {/* Row 1: Debounced Input */}
            {/* display this if global_search string is not in execlude_components list */}
            {execlude_components?.includes("global_search") ? null : (
              <div className={`w-full ${isLarge ? "lg:w-auto" : "mb-4"}`}>
                <DebouncedInput
                  value={globalFilter ?? ""}
                  onChange={(value) => setGlobalFilter(String(value))}
                  className="w-full p-2 font-lg shadow border border-block"
                  placeholder="Search all fields..."
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 items-center">
            {/* {execlude_components?.includes("execute_all") ? null : (
              <div className={`w-full ${isLarge ? "lg:w-auto" : "mb-4"}`}>
                <Tooltip label={"Execute all action steps"}>
                  <Button variant="outline" size="compact-xs">
                    Execute All
                  </Button>
                </Tooltip>
              </div>
            )} */}
            {execlude_components?.includes("execute_selected") ? null : (
              <div className={`w-full ${isLarge ? "lg:w-auto" : "mb-4"}`}>
                <Tooltip label={"Execute selected action steps"}>
                  <Button variant="outline" size="compact-xs">
                    Execute Selected
                  </Button>
                </Tooltip>
              </div>
            )}
            {execlude_components?.includes("follow_up") ? null : (
              <div className={`w-full ${isLarge ? "lg:w-auto" : "mb-4"}`}>
                {/* <Switch defaultChecked label="Live Updates" /> */}
                <Tooltip label={"Follow up"}>
                  <Button variant="outline" size="compact-xs">
                    Follow up
                  </Button>
                </Tooltip>
              </div>
            )}
            {execlude_components?.includes("save") ? null : (
              <div className={`w-full ${isLarge ? "lg:w-auto" : "mb-4"}`}>
                <Reveal
                  target={
                    <Tooltip
                      label={
                        "Download current results locally or save remotely"
                      }
                    >
                      <Button variant="outline" size="compact-xs">
                        Save
                      </Button>
                    </Tooltip>
                  }
                  trigger="click"
                >
                  <Tabs defaultValue="download">
                    <Tabs.List>
                      <Tabs.Tab
                        value="download"
                        leftSection={<IconDownload size={16} />}
                      >
                        Download
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="save_to_cloud"
                        leftSection={<IconLink size={16} />}
                      >
                        Save To Cloud
                      </Tabs.Tab>
                      <Tabs.Tab
                        value="save_to_database"
                        leftSection={<IconDatabase size={16} />}
                      >
                        Save To Database
                      </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="download">
                      <div className="overflow-auto min-h-[300px] h-[30vh] max-h-[600px]">
                        <ActionInputWrapper
                          name="save"
                          query_name="data_model"
                          exclude_components={["submit_button", "input_mode"]}
                        ></ActionInputWrapper>
                      </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="save_to_cloud">
                      <div className="overflow-auto min-h-[300px] h-[30vh] max-h-[600px]">
                        <ActionInputWrapper
                          name="save"
                          query_name="data_model"
                          exclude_components={["submit_button", "input_mode"]}
                        ></ActionInputWrapper>
                      </div>
                    </Tabs.Panel>
                    <Tabs.Panel value="save_to_database">
                      <div className="overflow-auto min-h-[300px] h-[30vh] max-h-[600px]">
                        <ActionInputWrapper
                          name="save"
                          query_name="data_model"
                          exclude_components={["input_mode"]}
                        ></ActionInputWrapper>
                      </div>
                    </Tabs.Panel>
                  </Tabs>
                </Reveal>
              </div>
            )}
            {execlude_components?.includes("live_updates") ? null : (
              <div className={`w-full ${isLarge ? "lg:w-auto" : "mb-4"}`}>
                {/* <Switch defaultChecked label="Live Updates" /> */}
                <Tooltip
                  label={
                    "Toggle to see action steps results change while you type"
                  }
                >
                  <Button variant="outline" size="compact-xs">
                    Live Updates
                  </Button>
                </Tooltip>
              </div>
            )}

            {/* <div className={`w-full ${isLarge ? "lg:w-auto" : "mb-4"}`}>
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
              className="w-full p-2 font-lg shadow border border-block"
              placeholder="Search all columns..."
            />
          </div> */}

            {/* <div>
            <ActivateActionsSelection
              record={{}}
              resultsSection={{ name: name }}
            ></ActivateActionsSelection>
          </div> */}

            {/* Row 2: Other Elements */}
            {/* display this if custom_views_columns_view_as string is not in execlude_components list */}
            {execlude_components?.includes(
              "custom_views_columns_view_as"
            ) ? null : (
              <div
                className={`flex ${
                  isLarge ? "flex-row" : "flex-row"
                } w-full lg:w-auto gap-3`}
              >
                {execlude_components?.includes("custom_views") ? null : (
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
                )}
                {execlude_components?.includes("columns") ? null : (
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
                        ?.getAllColumns()
                        ?.filter((column) => column.getCanHide())
                        ?.map((column) => (
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
                )}

                {execlude_components?.includes("view_as") ? null : (
                  <SelectViewAs
                    viewAsValue={viewAsvalue}
                    setViewAsValue={setViewAsValue}
                  ></SelectViewAs>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border p-3">
        {/* loop through through included custom views */}
        {(viewAsvalue === "" || viewAsvalue === "table") && (
          <TableView
            data_items={data_items}
            isLoadingDataItems={isLoadingDataItems ?? false}
            data_fields={data_fields}
            tableInstance={table}
            resource_group={resource_group}
            ui={ui}
            // view_data={view_data}
          />
          // <div>tableview</div>
        )}
        {/* {viewAsvalue === "conversation" && (
          <ConversationView
            data_items={data_items}
            isLoadingDataItems={isLoadingDataItems ?? false}
            data_columns={data_columns}
            tableInstance={table}
            resource_group={resource_group}
            view_data={view_data}
          />
        )} */}
        {viewAsvalue === "json" && (
          <MonacoEditor
            value={table?.getFilteredRowModel().rows.map((row) => row.original)}
            language="json"
            height="100vh"
          />
        )}
        {/* {viewAsvalue === "code_editor" && (
          <MonacoEditor
            value={table?.getFilteredRowModel().rows.map((row) => row.original)}
            language="json"
            height="100vh"
          />
        )} */}
        {/* {viewAsvalue === "text_editor" && (
          <MonacoEditor
            value={table?.getFilteredRowModel().rows.map((row) => row.original)}
            language="json"
            height="100vh"
          />
        )} */}
        {/* {viewAsvalue === "application_embeds" && <div>coming soon...</div>} */}
        {/* {viewAsvalue === "spreadsheet" && (
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
        )} */}
      </div>
      {execlude_components?.includes("pagination") ? null : (
        <div className="flex items-center justify-end space-x-2 p-3">
          <div className="flex-1 text-sm text-muted-foreground">
            {table?.getFilteredSelectedRowModel()?.rows?.length} of{" "}
            {table?.getFilteredRowModel()?.rows?.length} row(s) selected.
          </div>
          {/* {JSON.stringify(execlude_components)} */}
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table?.previousPage()}
              disabled={!table?.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table?.nextPage()}
              disabled={!table?.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export default DataDisplay;

// function Filter({ column }: { column: Column<any, unknown> }) {
//   const columnFilterValue = column.getFilterValue();

//   return (
//     <DebouncedInput
//       type="text"
//       value={(columnFilterValue ?? "") as string}
//       onChange={(value) => column.setFilterValue(value)}
//       placeholder={`Search...`}
//       className="w-36 border shadow rounded"
//     />
//   );
// }

// // A typical debounced input react component
// function DebouncedInput({
//   value: initialValue,
//   onChange,
//   debounce = 500,
//   ...props
// }: {
//   value: string | number;
//   onChange: (value: string | number) => void;
//   debounce?: number;
// } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
//   const [value, setValue] = React.useState(initialValue);

//   React.useEffect(() => {
//     setValue(initialValue);
//   }, [initialValue]);

//   React.useEffect(() => {
//     const timeout = setTimeout(() => {
//       onChange(value);
//     }, debounce);

//     return () => clearTimeout(timeout);
//   }, [value]);

//   return (
//     <Input
//       {...props}
//       value={value}
//       onChange={(e) => setValue(e.target.value)}
//     />
//   );
// }
