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
import { Card, Group, Badge, Container } from "@mantine/core";

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

import dynamic from "next/dynamic";

// Dynamically import Nivo components to support ESM
const ResponsivePie = dynamic(
  () => import("@nivo/pie").then((mod) => mod.ResponsivePie),
  { ssr: false }
);
const ResponsiveLine = dynamic(
  () => import("@nivo/line").then((mod) => mod.ResponsiveLine),
  { ssr: false }
);
const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((mod) => mod.ResponsiveBar),
  { ssr: false }
);

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
    globalFilterFn: "includesString", //apply fuzzy filter to the global filter (most common use case for fuzzy filter)
    filterFns: {
      //add the fuzzy filter to the filter functions
      fuzzy: fuzzyFilter,
    }, //define as a filter function that can be used in column definitions
    state: {
      // sorting,
      columnFilters,
      // columnVisibility,
      // rowSelection,
      // globalFilter,
    },
    // initialState: {
    //   columnFilters: [
    //     {
    //       id: "payment_status_comparison",
    //       value: `match`, // filter the name column by 'John' by default
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
                  (item: { name: string }) =>
                    item &&
                    selectedRecords[`${action_input_form_values_key}`]?.some(
                      (record: { name: string }) => record.name === item?.name
                    )
                ) ?? []
              }
            ></Board>
          ))}

        {focused_entities[record?.id]?.["display_mode"]?.name !== "board" &&
          entity_type !== "action_steps" &&
          record?.name !== "summary" && (
            <>
              {/* {JSON.stringify(columnFilters)} */}
              {/* {JSON.stringify(table.getState().columnFilters)} */}
              {/* {JSON.stringify(table?.getVisibleFlatColumns())} */}
              {/* {JSON.stringify(
                table?.getFilteredRowModel().rows.map((row) => row.original)
              )} */}
              <TableView
                // data_items={data_items ?? []}
                isLoadingDataItems={isLoadingDataItems ?? false}
                data_fields={
                  selectedRecords[`${action_input_form_values_key}`] ?? []
                }
                tableInstance={table}
                resource_group={record?.entity_type || entity_type}
                ui={ui || {}}
              />
            </>
          )}

        {focused_entities[record?.id]?.["display_mode"]?.name !== "board" &&
          entity_type !== "action_steps" &&
          record?.name == "summary" && (
            <>
              {/* {JSON.stringify(columnFilters)} */}
              {/* {JSON.stringify(table.getState().columnFilters)} */}
              {/* {JSON.stringify(table?.getVisibleFlatColumns())} */}
              {/* {JSON.stringify(
                table?.getFilteredRowModel().rows.map((row) => row.original)
              )} */}
              {/* <TableView
                // data_items={data_items ?? []}
                isLoadingDataItems={isLoadingDataItems ?? false}
                data_fields={
                  selectedRecords[`${action_input_form_values_key}`] ?? []
                }
                tableInstance={table}
                resource_group={record?.entity_type || entity_type}
                ui={ui || {}}
              /> */}
              <DataAnalysisExample />
            </>
            // <div>
            //   {JSON.stringify(
            //     selectedRecords[`${action}_action_input_${record?.id}`]
            //   )}
            // </div>
            // <div>{JSON.stringify(data_fields)}</div>
            // <div>{JSON.stringify(tableColumns)}</div>
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

const DataAnalysisExample = () => {
  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <Container>
        {/* Dashboard Title */}
        {/* <Text className="text-4xl font-bold mb-6">
          Travel Automation Analytics Dashboard
        </Text> */}

        {/* Overview Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card shadow="sm" p="lg" className="bg-white">
            <Group className="mb-3">
              <Text>Total Bookings</Text>
              <Badge color="green">+12%</Badge>
            </Group>
            <Text className="text-3xl font-semibold">8,430</Text>
          </Card>

          <Card shadow="sm" p="lg" className="bg-white">
            <Group className="mb-3">
              <Text>Pending Issues</Text>
              <Badge color="red">+18%</Badge>
            </Group>
            <Text className="text-3xl font-semibold">320</Text>
          </Card>

          <Card shadow="sm" p="lg" className="bg-white">
            <Group className="mb-3">
              <Text>Successful Payments</Text>
              <Badge color="blue">+15%</Badge>
            </Group>
            <Text className="text-3xl font-semibold">$3.5M</Text>
          </Card>

          <Card shadow="sm" p="lg" className="bg-white">
            <Group className="mb-3">
              <Text>Cancellations</Text>
              <Badge color="orange">-5%</Badge>
            </Group>
            <Text className="text-3xl font-semibold">780</Text>
          </Card>
        </div>

        {/* Pie Chart Section */}
        <Card shadow="sm" p="lg" className="bg-white mb-8">
          <Text className="text-xl font-bold mb-4">
            Booking Distribution by Service Type
          </Text>
          <div className="h-80">
            <ResponsivePie
              data={[
                { label: "Flights", value: 45 } as {
                  label: string;
                  value: number;
                },
                { label: "Hotels", value: 25 },
                { label: "Cars", value: 15 },
                { label: "Transfers", value: 10 },
                { label: "Activities", value: 5 },
              ]}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
            />
          </div>
        </Card>

        {/* Issue Trends Section */}
        <Card shadow="sm" p="lg" className="bg-white mb-8">
          <Text className="text-xl font-bold mb-4">
            Issues Trends (Open vs Closed)
          </Text>
          <div className="h-80">
            <ResponsiveBar
              data={[
                { month: "January", open: 100, closed: 80 },
                { month: "February", open: 150, closed: 120 },
                { month: "March", open: 200, closed: 180 },
                { month: "April", open: 170, closed: 160 },
                { month: "May", open: 220, closed: 200 },
              ]}
              keys={["open", "closed"]}
              indexBy="month"
              margin={{ top: 40, right: 50, bottom: 50, left: 60 }}
              axisBottom={{
                legend: "Month",
                legendPosition: "middle",
                legendOffset: 32,
              }}
              axisLeft={{ legend: "Issues", legendOffset: -40 }}
              colors={{ scheme: "paired" }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              enableGridY={true}
            />
          </div>
        </Card>

        {/* Bar Chart Section */}
        <Card shadow="sm" p="lg" className="bg-white mb-8">
          <Text className="text-xl font-bold mb-4">Issues by Category</Text>
          <div className="h-80">
            <ResponsiveBar
              data={[
                { category: "Payment", issues: 120 },
                { category: "Supplier Mismatch", issues: 90 },
                { category: "Cancellation Errors", issues: 60 },
                { category: "Booking Confirmations", issues: 50 },
              ]}
              keys={["issues"]}
              indexBy="category"
              margin={{ top: 40, right: 50, bottom: 50, left: 60 }}
              axisBottom={{
                legend: "Category",
                legendPosition: "middle",
                legendOffset: 32,
              }}
              axisLeft={{ legend: "Issues", legendOffset: -40 }}
            />
          </div>
        </Card>

        {/* Table Section */}
        <Card shadow="sm" p="lg" className="bg-white mb-8">
          <Text className="text-xl font-bold mb-4">
            Top Issues Requiring Escalation
          </Text>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b-2">Issue Type</th>
                  <th className="px-4 py-2 border-b-2">Category</th>
                  <th className="px-4 py-2 border-b-2">Affected Bookings</th>
                  <th className="px-4 py-2 border-b-2">Pending Since</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 border-b">Payment Discrepancy</td>
                  <td className="px-4 py-2 border-b">Payment</td>
                  <td className="px-4 py-2 border-b">45</td>
                  <td className="px-4 py-2 border-b">5 days</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b">Supplier Mismatch</td>
                  <td className="px-4 py-2 border-b">Supplier</td>
                  <td className="px-4 py-2 border-b">30</td>
                  <td className="px-4 py-2 border-b">3 days</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 border-b">
                    Unconfirmed Cancellations
                  </td>
                  <td className="px-4 py-2 border-b">Cancellation</td>
                  <td className="px-4 py-2 border-b">20</td>
                  <td className="px-4 py-2 border-b">7 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary Section */}
        <Card shadow="sm" p="lg" className="bg-white mb-8">
          <Text className="text-xl font-bold mb-4">
            Summary of Margins and Financials
          </Text>
          <Text>Total Revenue: $3.5M</Text>
          <Text>Total Costs: $2.1M</Text>
          <Text>Profit Margin: 40%</Text>
          <Text>Refunds Processed: $200k</Text>
          <Text>Pending Refunds: $50k</Text>
        </Card>
      </Container>
    </div>
  );
};
