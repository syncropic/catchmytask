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
const PAGE_SIZES = [10, 15, 20];

export function DataDisplay<T extends Record<string, any>>({
  record,
  data_items,
  data_fields,
  isLoadingDataItems,
  resource_group,
  execlude_components,
  name,
  read_write_mode,
  ui,
  invalidate_queries_on_submit_success,
}: ResultsComponentProps<T>) {
  const { ref, width } = useElementSize();
  const [isLarge, setIsLarge] = useState(true);
  const { selectedRecords } = useAppStore();
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

  const [pageSize, setPageSize] = useState(PAGE_SIZES[1]);

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  const [page, setPage] = useState(1);
  const [records, setRecords] = useState(data_items.slice(0, pageSize));

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecords(data_items.slice(from, to));
  }, [page, pageSize]);

  return (
    <>
      <div className="w-full">
        {/* <div>{JSON.stringify(data_items)}</div> */}
        {/* <div>{JSON.stringify(table?.getAllColumns())}</div> */}
        {/* <div>{width}</div> */}
        {/* <div>{JSON.stringify(isLarge)}</div> */}
        {/* {JSON.stringify(table.getVisibleFlatColumns().map((column) => column))} */}
        <Tabs defaultValue="follow up prompt selected">
          <Tabs.List>
            <Tabs.Tab value="follow up prompt selected">
              <Tooltip label="follow up prompt selected" position="left">
                <div className="flex flex-col items-center">
                  <div>
                    <ActionIcon size="sm" variant="outline">
                      <IconZoomCode size={18} />
                    </ActionIcon>
                  </div>
                  <Text size="xs">query</Text>
                </div>
              </Tooltip>
            </Tabs.Tab>

            <Tabs.Tab value="execute selected">
              <Tooltip label="execute selected" position="left">
                <div className="flex flex-col items-center">
                  <div>
                    <ActionIcon size="sm" variant="outline" color="green">
                      <IconPlayerPlay size={18} />
                    </ActionIcon>
                  </div>
                  <Text size="xs">execute</Text>
                </div>
              </Tooltip>
            </Tabs.Tab>
            <Tabs.Tab value="save selected">
              <Tooltip label="save selected" position="left">
                <div className="flex flex-col items-center">
                  <div>
                    <ActionIcon size="sm" variant="outline" color="orange">
                      <IconFileDownload size={18} />
                    </ActionIcon>
                  </div>
                  <Text size="xs">save</Text>
                </div>
              </Tooltip>
            </Tabs.Tab>
            <Tabs.Tab value="share selected">
              <Tooltip label="share selected" position="left">
                <div className="flex flex-col items-center">
                  <div>
                    <ActionIcon size="sm" variant="outline" color="indigo">
                      <IconShare size={18} />
                    </ActionIcon>
                  </div>
                  <Text size="xs">share</Text>
                </div>
              </Tooltip>
            </Tabs.Tab>
            <Tabs.Tab value="cancel execution selected">
              <Tooltip label="cancel selected" position="left">
                <div className="flex flex-col items-center">
                  <div>
                    <ActionIcon size="sm" variant="outline" color="red">
                      <IconCircleX size={18} />
                    </ActionIcon>
                  </div>
                  <Text size="xs">cancel</Text>
                </div>
              </Tooltip>
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="save selected" pt="xs">
            <ActionInputWrapper
              name="save"
              query_name="data_model"
              record={record}
              include_form_components={["natural language prompt"]}
              success_message_code="action_input_data_model_schema"
              update_action_input_form_values_on_submit_success={true}
              // nested_component={{
              //   data_model: {
              //     name: "task_config",
              //   },
              // }}
              endpoint="save"
              action_label="Catch"
            ></ActionInputWrapper>
          </Tabs.Panel>
          <Tabs.Panel value="execute selected" pt="xs">
            <ActionInputWrapper
              name="execute"
              query_name="data_model"
              record={record}
              include_form_components={["natural language prompt"]}
              success_message_code="action_input_data_model_schema"
              update_action_input_form_values_on_submit_success={true}
              // nested_component={{
              //   data_model: {
              //     name: "task_config",
              //   },
              // }}
              endpoint="execute"
              action_label="Catch"
            ></ActionInputWrapper>
          </Tabs.Panel>
          <Tabs.Panel value="follow up prompt selected" pt="xs">
            <ActionInputWrapper
              name="query"
              query_name="data_model"
              record={record}
              include_form_components={["natural language prompt"]}
              success_message_code="action_input_data_model_schema"
              update_action_input_form_values_on_submit_success={true}
              // nested_component={{
              //   data_model: {
              //     name: "task_config",
              //   },
              // }}
              endpoint="query"
              action_label="Catch"
            ></ActionInputWrapper>
          </Tabs.Panel>
          <Tabs.Panel value="cancel execution selected" pt="xs">
            <ActionInputWrapper
              name="cancel"
              query_name="data_model"
              record={record}
              include_form_components={["natural language prompt"]}
              success_message_code="action_input_data_model_schema"
              update_action_input_form_values_on_submit_success={true}
              // nested_component={{
              //   data_model: {
              //     name: "task_config",
              //   },
              // }}
              endpoint="plan"
              action_label="Catch"
            ></ActionInputWrapper>
          </Tabs.Panel>
          <Tabs.Panel value="share selected" pt="xs">
            <ActionInputWrapper
              name="share"
              query_name="data_model"
              record={record}
              include_form_components={["natural language prompt"]}
              success_message_code="action_input_data_model_schema"
              update_action_input_form_values_on_submit_success={true}
              // nested_component={{
              //   data_model: {
              //     name: "task_config",
              //   },
              // }}
              endpoint="share"
              action_label="Catch"
            ></ActionInputWrapper>
          </Tabs.Panel>
        </Tabs>
        <div
          ref={ref}
          // className={`flex p-3 ${
          //   isLarge ? "flex-row" : "flex-col"
          // } py-1 gap-1 justify-between items-center`}
          className={`flex flex-row p-3 py-1 gap-1 justify-between items-center`}
        >
          <div>
            {/* Row 1: Debounced Input */}
            {/* display this if global_search string is not in execlude_components list */}
          </div>
          <div className="flex gap-3 items-center">
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

                {/* {execlude_components?.includes("view_as") ? null : (
                  <SelectViewAs
                    viewAsValue={viewAsvalue}
                    setViewAsValue={setViewAsValue}
                  ></SelectViewAs>
                )} */}
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
            execlude_components={execlude_components}
            invalidate_queries_on_submit_success={
              invalidate_queries_on_submit_success
            }
            // view_data={view_data}
          />
          // <div>tableview</div>
        )}

        {viewAsvalue === "json" && (
          <MonacoEditor
            value={table?.getFilteredRowModel().rows.map((row) => row.original)}
            language="json"
            height="100vh"
          />
        )}
      </div>
      {execlude_components?.includes("pagination") ? null : (
        <div className="flex items-center justify-end space-x-2 p-3">
          <div className="flex-1 text-sm text-muted-foreground">
            {table?.getFilteredSelectedRowModel()?.rows?.length} of{" "}
            {table?.getFilteredRowModel()?.rows?.length} row(s) selected.
          </div>
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
