"use client";
import MonacoEditor from "@components/MonacoEditor";
import {
  componentMapping,
  createColumnDef,
  extractIdentifier,
  getComponentByResourceType,
  replacePlaceholdersInObject,
  useDataColumns,
  useFetchViewByName,
  useTableColumns,
} from "@components/Utils";
import { useQueryClient } from "@tanstack/react-query";
// import ViewActionHistory from "@components/ViewActionHistory";
import { DataTable } from "mantine-datatable";
import {
  CompleteActionComponentProps,
  ComponentKey,
  FieldConfiguration,
  IIdentity,
  IView,
  ResultsComponentProps,
} from "@components/interfaces";
import { aggregate_views, views } from "@data/index";
import {
  Accordion,
  ActionIcon,
  Modal,
  Popover,
  TextInput,
  Textarea,
  Tooltip,
} from "@mantine/core";
import { useClickOutside, useDisclosure } from "@mantine/hooks";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import {
  IconColumns,
  IconEye,
  IconFilter,
  IconMathFunction,
  IconSearch,
} from "@tabler/icons-react";
import _, { set } from "lodash";
import CreateAutomation from "pages/automations/create";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "src/store";
import { v4 as uuidv4 } from "uuid";
import QueryBar from "@components/QueryBar";
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
  const { tableColumns } = useTableColumns({
    field_configurations: view_data?.data[0]?.field_configurations,
    table_id: resource_group,
  });
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [viewAsvalue, setViewAsValue] = React.useState(
    view_data?.data[0]?.main_results_view_as ?? ""
  );
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
  console.log("columnFilters", columnFilters);
  // let visibleColumns = table?.getVisibleFlatColumns() ?? [];
  // console.log("tableColumns", tableColumns);
  // console.log(
  //   "visibleColumns",
  //   visibleColumns.map((column) => column.getCanFilter())
  // );

  return (
    <>
      <div className="w-full">
        <div className="flex py-4 gap-8 justify-between">
          <div className="flex gap-2">
            {/* <Input
              placeholder="Search results ..."
              // value={
              //   (table
              //     .getColumn(`${table_id}-sst_booking_number`)
              //     ?.getFilterValue() as string) ?? ""
              // }
              // onChange={(event) =>
              //   table
              //     .getColumn(`${table_id}-sst_booking_number`)
              //     ?.setFilterValue(event.target.value)
              // }
              // className="max-w-sm"
            /> */}
            <DebouncedInput
              value={globalFilter ?? ""}
              onChange={(value) => setGlobalFilter(String(value))}
              className="p-2 font-lg shadow border border-block"
              placeholder="Search all columns..."
            />
            {/* <Tooltip label="sort & filter">
              <ActionIcon
                aria-label="Settings"
                // onClick={() => handleRecordSelection(record)}
              >
                <IconFilter size={16} />
              </ActionIcon>
            </Tooltip> */}
          </div>

          <ActivateActionsSelection
            record={{}}
            resultsSection={results}
          ></ActivateActionsSelection>

          <div className="flex gap-3">
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
              {/* include aggregate views such as dj decks, graphs, results lists
              etc. */}
              {aggregate_views.map((item) => {
                return (
                  <div
                    className="flex items-center space-x-2 p-1"
                    key={item.value}
                  >
                    <Checkbox
                      id={item.value}
                      checked={item.visible}
                      // checked={column.getIsVisible()}
                      // onCheckedChange={(value) =>
                      //   column.toggleVisibility(!!value)
                      // }
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {item.label}
                    </label>
                  </div>
                );
              })}
            </Reveal>

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
              {/* <div>columns selection and ordering</div> */}
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
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
                        htmlFor="terms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {getColumnIdWithoutResourceGroup(
                          column.id,
                          resource_group
                        )}
                      </label>
                    </div>
                  );
                })}
            </Reveal>
            <div>
              <SelectViewAs
                viewAsValue={viewAsvalue}
                setViewAsValue={setViewAsValue}
              ></SelectViewAs>
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
          {viewAsvalue === "json" && (
            <MonacoEditor
              value={table
                ?.getFilteredRowModel()
                .rows.map((row) => row.original)}
              language="json"
              height="100vh"
            />
          )}
          {viewAsvalue === "code_editor" && (
            <MonacoEditor
              value={table
                ?.getFilteredRowModel()
                .rows.map((row) => row.original)}
              language="json"
              height="100vh"
            />
          )}
          {viewAsvalue === "text_editor" && (
            <MonacoEditor
              value={table
                ?.getFilteredRowModel()
                .rows.map((row) => row.original)}
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

{
  /* <EmbedComponent></EmbedComponent> */
}
{
  /* <WebBrowserView
        url={`${
          process.env.NEXT_PUBLIC_CMT_API_BASEURL
        }/web-browser?url=${encodeURIComponent(url)}`}
      ></WebBrowserView> */
}
{
  /* <iframe
        src={url}
        style={{ flex: 1, border: "none" }}
        title="Web Browser"
        height={"100%"}
        width={"100%"}
      /> */
}

// const EmbedComponent = () => {
//   const [url, setUrl] = useState("");
//   const [embedHtml, setEmbedHtml] = useState("");

//   let embedAPIEndpoint = `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/embed`;

//   const handleSubmit = async (e: any) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(embedAPIEndpoint, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           url,
//           maxwidth: 800,
//           autoplay: true,
//         }),
//       });

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const data = await response.json();
//       setEmbedHtml(data.html);
//     } catch (error) {
//       console.error("Error fetching embed:", error);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={url}
//           onChange={(e) => setUrl(e.target.value)}
//           placeholder="Enter URL"
//           required
//         />
//         <button type="submit">Embed</button>
//       </form>
//       {embedHtml && <div dangerouslySetInnerHTML={{ __html: embedHtml }} />}
//     </div>
//   );
// };

{
  /* <TableView
results={results}
data_items={data_items}
data_columns={data_columns}
tableInstance={table}
isLoadingDataItems={isLoadingDataItems}
/> */
}
