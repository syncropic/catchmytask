"use client";
import MonacoEditor from "@components/MonacoEditor";
import {
  DebouncedInput,
  isAllLocalDBSuccess,
  mergeEdgeWithEntityValues,
  useFetchQueryDataByState,
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
import { useEffect, useState } from "react";
import { useElementSize } from "@mantine/hooks";
import { useAppStore } from "src/store";
import Board from "@components/Board";

import dynamic from "next/dynamic";
// import { initializeLocalDB } from "src/local_db";
import { useDuckDB } from "pages/_app";

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

  const {
    focused_entities,
    selectedRecords,
    sortedRecords,
    fields,
    setFields,
  } = useAppStore();

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

  const table = useReactTable({
    data: data_items ?? [],
    columns: tableColumns ?? [],
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

  // let selected_record_items_key = `${action}_action_input_${record?.id}`;
  const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  let action_input_form_values_key = `${action}_action_input_${actionInputId}`;
  // return board for action steps by default
  if (entity_type === "action_steps") {
    action_input_form_values_key = `plan_action_input_${actionInputId}`;

    return (
      // <div>
      //   {JSON.stringify(selectedRecords[`${action_input_form_values_key}`])}
      // </div>
      // <div>
      //   {JSON.stringify(
      //     data_items?.filter(
      //       (item: { name: string }) =>
      //         item &&
      //         selectedRecords[`${action_input_form_values_key}`]?.some(
      //           (record: { name: string }) => record.name === item?.name
      //         )
      //     )
      //   )}
      // </div>
      <Board
        data_fields={data_items?.filter(
          (item: { name: string }) =>
            item &&
            selectedRecords[`${action_input_form_values_key}`]?.some(
              (record: { name: string }) => record.name === item?.name
            )
        )}
      ></Board>
    );
  }
  // return summary if record?.name === "summary"
  if (record?.name === "summary") {
    return <SummaryComponent record={record} entity_type={entity_type} />;
  }

  // return summary if record?.name === "summary"
  if (entity_type === "summary") {
    return <div>summary entity type</div>;
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
      <TableView
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
      />
    </>
  );
}

export default DataDisplay;

const SummaryComponent = ({
  record,
  entity_type,
}: {
  record?: any;
  entity_type?: string;
}) => {
  // let selected_record_items_key = `${action}_action_input_${record?.id}`;
  const dbInstance = useDuckDB(); // Get the DuckDB instance from the context

  const { activeTask, selectedRecords, local_db } = useAppStore();
  const actionInputId =
    activeTask?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  const action_input_form_values_key = `action_input_${actionInputId}`;
  let selectedActionSteps = selectedRecords[`${action_input_form_values_key}`];

  // // State to store filtered data from DuckDB
  // const [dataItems, setDataItems] = useState([]);
  // const [dataFields, setDataFields] = useState([]);
  const [summaryData, setSummaryData] = useState<any[]>([]);

  let allLocalDBSuccess = isAllLocalDBSuccess(local_db);

  // let action_plan_state = {
  //   id: activeTask?.id,
  //   query_name: "read action plan data with task info",
  //   task_id: activeTask?.id,
  //   success_message_code: "action_plan",
  // };
  // const {
  //   data: actionPlanData,
  //   isLoading: actionPlanIsLoading,
  //   error: actionPlanError,
  // } = useFetchQueryDataByState(action_plan_state);

  // data_items={
  //   actionPlanData?.data?.find(
  //     (item: any) => item?.message?.code === "action_plan"
  //   )?.data || []
  // }

  // data_fields={
  //   data_items?.filter(
  //     (item: { name: string }) =>
  //       item &&
  //       selectedRecords[`${action_input_form_values_key}`]?.some(
  //         (record: { name: string }) => record.name === item?.name
  //       )
  //   ) ?? []
  // }
  // if (actionPlanError)
  //   return <div>Error: {JSON.stringify(actionPlanError)}</div>;
  // if (actionPlanIsLoading) return <div>Loading...</div>;

  // list all active action steps

  let data_fields = [
    {
      name: "name",
      data_type: "string",
    },
    {
      name: "count",
      data_type: "number",
    },
    // {
    //   name: "average",
    //   data_type: "number",
    // },
    // {
    //   name: "sum",
    //   data_type: "number",
    // },
    // {
    //   name: "unique",
    //   data_type: "string",
    // },
    // {
    //   name: "trend",
    //   data_type: "string",
    // },
    // {
    //   name: "range",
    //   data_type: "string",
    // },
  ];

  // Effect to trigger DuckDB query whenever globalQuery or tableName changes
  useEffect(() => {
    // console.log("globalQuery", globalQuery);
    // console.log("tableName", tableName);
    // console.log("allLocalDBSuccess", allLocalDBSuccess);
    const fetchFromDuckDB = async () => {
      if (allLocalDBSuccess && selectedActionSteps && dbInstance) {
        // let data_fields =
        //   data?.data?.find(
        //     (item: any) => item?.message?.code === record?.success_message_code
        //   )?.data_fields || [];
        // console.log("globalQuery", globalQuery);
        // console.log("tableName", tableName);
        // console.log("data", data);
        // console.log("data_fields", data_fields);
        // setDataFields(data_fields);
        const results = [];
        try {
          // const conn = await initializeLocalDB();
          console.log("allLocalDBSuccess", allLocalDBSuccess);
          console.log("selectedActionSteps", selectedActionSteps);
          // filter only selected action steps when succcess_message_code is 'items_payment_analysis'
          const tableName = "items_payment_analysis";
          // let filteredSelectedActionSteps = selectedActionSteps.filter(
          //   (item) => item.success_message_code === tableName
          // );

          // Set the max expression depth to a higher value
          // await conn.query("SET max_expression_depth TO 1000");
          // let query = globalQuery
          //   ? `SELECT * FROM ${tableName} WHERE ${globalQuery}`
          //   : `SELECT * FROM ${tableName}`;
          // console.log("Executing DuckDB query:", query);
          // const result = await conn.query(query);
          // console.log("DuckDB query result:", result);
          // Use the data fields from the fetched data
          // setDataItems(result.toArray());
          // close the connection
          // conn.close();
          for (const table of selectedActionSteps) {
            const tableName = table.success_message_code;

            try {
              // Check if the table exists in the DuckDB database
              const checkTableQuery = `SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_name = '${tableName}'`;
              console.log(
                `Checking if table exists: ${tableName} // ${checkTableQuery}`
              );

              const tableCheckResult = await dbInstance.query(checkTableQuery);
              const tableExists = tableCheckResult.toArray()[0]?.count > 0;

              if (!tableExists) {
                console.log(`Table ${tableName} does not exist. Skipping.`);
                continue; // Skip to the next table
              }

              // Proceed to query the table if it exists
              const query = `SELECT COUNT(*) AS count FROM ${tableName}`;
              console.log(
                `Executing query for table: ${tableName} // ${query}`
              );

              const result = await dbInstance.query(query);
              let count = result.toArray()[0]?.count || 0;

              // Convert count to a regular number if it is a BigInt
              if (typeof count === "bigint") {
                count = Number(count);
              }

              // Add the result to the results array
              const resultItem = {
                name: table.name,
                success_message_code: tableName,
                count: count,
              };
              results.push(resultItem);
              console.log(`Result item for table ${tableName}:`, resultItem);
            } catch (error) {
              console.error(`Error querying table ${tableName}:`, error);
            }
          }

          // Set the summary data
          setSummaryData(results);
        } catch (err) {
          console.error("Error querying DuckDB:", err);
        }
      }
    };
    fetchFromDuckDB();
  }, [selectedActionSteps, allLocalDBSuccess, dbInstance]);

  // console.log("allLocalDBSuccess", allLocalDBSuccess);
  // console.log("selectedActionSteps", selectedActionSteps);
  // console.log("local_db", local_db);
  // console.log("david", "david");
  // if (selectedActionSteps) {
  //   console.log("selectedActionSteps", selectedActionSteps);
  // } else {
  //   console.log("selectedActionSteps is falsy:", selectedActionSteps);
  // }

  // use effect to console log the value of selectedActionSteps whenever it changes

  return (
    <div>
      {/* <div>{JSON.stringify(record?.success_message_code)}</div> */}
      {/* {summaryData && JSON.stringify(summaryData)}
      {data_fields && JSON.stringify(data_fields)} */}
      {/* <div>{JSON.stringify(local_db)}</div>
      <div>{JSON.stringify(allLocalDBSuccess)}</div> */}

      {/* <MonacoEditor
        // value={selectedActionSteps.map((item) => {
        //   return {
        //     name: item?.name,
        //     success_message_code: item?.success_message_code,
        //   };
        // })}
        value={local_db}
        language="json"
        height="75vh"
      /> */}
      {data_fields && summaryData && (
        <SummaryDisplay
          data_items={summaryData || []}
          data_fields={data_fields}
          record={record}
          resource_group={
            record?.success_message_code || record?.entity_type || entity_type
          }
          entity_type="summary"
        />
      )}
    </div>
  );
};

export function SummaryDisplay<T extends Record<string, any>>({
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

  // default return table view
  return (
    <>
      {/* <div>{JSON.stringify(record)}</div> */}
      <TableView
        // data_items={data_items ?? []}
        isLoadingDataItems={isLoadingDataItems ?? false}
        // data_fields={selectedRecords[`${action_input_form_values_key}`] ?? []}
        // data_fields={selectedRecords[`${action_input_form_values_key}`] || data_fields}
        data_fields={data_fields}
        tableInstance={table}
        resource_group={
          record?.success_message_code || record?.entity_type || entity_type
        }
        ui={ui || {}}
      />
    </>
  );
}
