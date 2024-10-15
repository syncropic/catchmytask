import { ResultsComponentProps } from "@components/interfaces";
import { useClipboard, useMediaQuery, useViewportSize } from "@mantine/hooks";
import { flexRender } from "@tanstack/react-table";
import { Table as TanStackTable, ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DataTableColumn,
  DataTableSortStatus,
  useDataTableColumns,
} from "mantine-datatable";
import { useEffect, useState } from "react";
import { getColumnIdWithoutResourceGroup } from "src/utils";
import { Column } from "@tanstack/react-table";
import React from "react";
import { DebouncedInput } from "@components/Utils";
import {
  ActionIcon,
  Box,
  Button,
  Card,
  Group,
  Tooltip,
  Text,
  CheckIcon,
} from "@mantine/core";
import { useAppStore } from "src/store";
import RecordActionsWrapper from "@components/RecordActions";
import { sortBy } from "lodash";
import ActionStepEditor from "@components/ActionStepEditor";
import MonacoEditor from "@components/MonacoEditor";
import { IconChevronRight, IconCopy, IconEye } from "@tabler/icons-react";
import clsx from "clsx";
import classes from "./NestedTablesExample.module.css";
import { access } from "fs";
import { render } from "react-dom";
import { useContextMenu } from "mantine-contextmenu";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { DatePicker } from "@mantine/dates";
import "dayjs/locale/en"; // Adjust locale if needed
import { formatInTimeZone } from "date-fns-tz"; // Use formatInTimeZone for time zone-aware formatting// import { initializeLocalDB } from "src/local_db";
import { showNotification } from "@mantine/notifications";
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

const PAGE_SIZES = [10, 15, 20];

export function TableView<T extends Record<string, any>>({
  tableInstance,
  nested_data_items,
  resource_group,
  data_fields,
  ui,
  execlude_components,
  invalidate_queries_on_submit_success,
  setSorting,
  sorting,
}: ResultsComponentProps<T>) {
  // const [selectedRecords, setSelectedRecords] = useState<T[]>([]);
  const {
    setActiveRecord,
    setActiveAction,
    selectedRecords,
    setSelectedRecords,
  } = useAppStore();

  const { height, width } = useViewportSize();

  // Media query for screens smaller than 640px (mobile devices)
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { showContextMenu } = useContextMenu();
  const isTouch = useMediaQuery("(pointer: coarse)");
  const clipboard = useClipboard({ timeout: 500 });

  // let columns_to_filter_out = ["select", "actions", "details"];

  const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);
  const [nestedExpandedRecordIds, setNestedExpandedRecordIds] = useState<
    string[]
  >([]);

  // const [localSortStatus, localSetSortStatus] = useState<DataTableSortStatus<T>>({
  //   columnAccessor: "id",
  //   direction: "asc",
  // });
  const [localSortStatus, localSetSortStatus] = useState<
    DataTableSortStatus<T>
  >({
    columnAccessor: sorting?.[0]?.id ?? "id", // Defaults to "id" if sorting is undefined or empty
    direction: sorting?.[0]?.desc ? "desc" : "asc", // Maps desc: true to "desc" and desc: false to "asc"
  });
  // const [records, setRecords] = useState(
  //   sortBy(
  //     tableInstance?.getFilteredRowModel().rows?.map((row) => row.original),
  //     "execution_order"
  //   ) as T[]
  // );

  // Update records whenever data_items change
  // useEffect(() => {
  //   const sortedData = sortBy(data_items, sortStatus.columnAccessor);
  //   setRecords(
  //     sortStatus.direction === "desc" ? sortedData.reverse() : sortedData
  //   );
  // }, [data_items, sortStatus]); // Trigger whenever data_items or sortStatus changes

  const handleSelectValue = (value: any) => {
    // console.log("selected value", value);
    let new_selected_records = {
      ...selectedRecords,
      [resource_group]: value,
    };
    setSelectedRecords(new_selected_records);
  };

  const key = resource_group;

  const [currentColumns, setCurrentColumns] = useState<DataTableColumn<T>[]>(
    []
  );

  const timeZone = "America/New_York"; // Specify the desired time zone (e.g., Eastern Time)
  // handle cell click
  const handleCellClick = (
    e: React.MouseEvent<HTMLDivElement>, // click event
    record: any,
    column: Column<T, unknown>,
    field: any,
    value: any
  ) => {
    e.stopPropagation(); // Stop the event from propagating
    clipboard.copy(value); // Copy the value to clipboard
    // Show notification
    showNotification({
      title: "Copied to clipboard",
      message: `Value "${value}" copied to clipboard`,
      // icon: <CheckIcon />, // Optional: You can display an icon
      color: "green", // Optional: Set the color of the notification
      autoClose: 2000, // Optional: Close the notification after 2 seconds
    });
  };

  // Effect to update columns whenever data_fields or sorting changes
  useEffect(() => {
    if (tableInstance) {
      const sortedColumns = [
        // Sort data_fields based on the index and map over them to build columns in the correct order
        ...data_fields
          .sort((a, b) => a.index - b.index)
          .map((field) => {
            const column = tableInstance
              .getVisibleFlatColumns()
              .find((col) => col.columnDef.header === field.name);

            if (!column) return null;

            return {
              id: column.id,
              accessor: column.columnDef.header,
              ellipsis: true,
              // draggable: false,
              // render: (record: T) => {
              //   const value = record[column.columnDef.header as keyof T];
              //   if (
              //     typeof value === "string" &&
              //     ["id", "related_id", "record_id", "name"].includes(
              //       String(column.columnDef.header)
              //     )
              //   ) {
              //     return (
              //       <div className="flex">
              //         <div>{value}</div>
              //       </div>
              //     );
              //   } else if (typeof value === "string") {
              //     return <div>{value}</div>;
              //   } else if (typeof value === "object") {
              //     return <div>{JSON.stringify(value)}</div>;
              //   } else {
              //     return <div>{String(value)}</div>;
              //   }
              // },
              render: (record: T) => {
                const value = record[column.columnDef.header as keyof T];
                const dataType = field.data_type; // Get data_type from the field
                // stop propagation to not expand row
                return (
                  <div
                    onClick={(e) =>
                      handleCellClick(e, record, column, field, value)
                    }
                  >
                    {value}
                  </div>
                );

                // Conditionally render based on data_type
                // if (dataType === "string") {
                //   return <div>{value}</div>;
                // } else if (dataType === "datetime") {
                //   return <div>{new Date(value).toUTCString()}</div>;
                // } else if (dataType === "float" || dataType === "integer") {
                //   return <div>{Number(value).toLocaleString()}</div>;
                // } else if (dataType === "boolean") {
                //   return <div>{value ? "Yes" : "No"}</div>;
                // } else {
                //   return <div>{JSON.stringify(value)}</div>;
                // }
              },
              resizable: true,
              width: 100,
              sortable: column.getCanSort(),
              filter: <Filter column={column} field={field} />,
            } as DataTableColumn<T>;
          })
          .filter(Boolean), // Filter out any null values if a column is not found

        // Ensure the "expand" column is always last
        {
          accessor: "expand",
          title: (
            <div className="flex justify-end">
              <Tooltip
                label={
                  expandedRecordIds.length === 0 ? "Expand All" : "Collapse All"
                }
                position="top"
                withArrow
              >
                <div className="cursor-pointer" onClick={() => toggleAllRows()}>
                  <IconChevronRight
                    className={clsx(classes.icon, classes.expandIcon, {
                      [classes.expandIconRotated]: expandedRecordIds.length > 0,
                      "text-blue-500": expandedRecordIds.length > 0,
                    })}
                  />
                </div>
              </Tooltip>
            </div>
          ),
          ellipsis: true,
          draggable: false,
          resizable: false,
          width: 60,
          render: (record: T) => (
            <div className="flex">
              <IconChevronRight
                className={clsx(classes.icon, classes.expandIcon, {
                  [classes.expandIconRotated]: expandedRecordIds.includes(
                    String(
                      record?.id ||
                        record?.related_id ||
                        record?.record_id ||
                        record?.name
                    )
                  ),
                })}
              />
            </div>
          ),
          filter: null, // No filter for actions column
        } as DataTableColumn<T>,
      ];

      // Update the currentColumns state to trigger a rerender with new columns
      setCurrentColumns(
        sortedColumns.filter((col): col is DataTableColumn<T> => col !== null)
      );
    }
  }, [data_fields, tableInstance, expandedRecordIds]);

  // Helper function to get record ID based on priority order
  const getRecordId = (record: any) => {
    return (
      record?.id || record?.related_id || record?.record_id || record?.name
    );
  };
  // Toggle all rows at once
  const toggleAllRows = () => {
    const allRecords =
      tableInstance
        ?.getFilteredRowModel()
        .rows.map((row) => getRecordId(row.original)) || [];

    if (expandedRecordIds.length === 0) {
      // Expand all rows
      setExpandedRecordIds(allRecords);
    } else {
      // Collapse all rows
      setExpandedRecordIds([]);
    }
  };

  // set sorting function
  const customSetSorting = (sortStatus: DataTableSortStatus<T>) => {
    localSetSortStatus(sortStatus);
    let mapped_item = {
      id: sortStatus.columnAccessor,
      desc: sortStatus.direction === "desc",
    };
    // // alert(JSON.stringify(mapped_item));
    setSorting([mapped_item]);
  };

  return (
    <>
      {/* <MonacoEditor value={data_items} language="json" height="50vh" /> */}
      {/* <div>{JSON.stringify(tableInstance?.getVisibleFlatColumns())}</div> */}
      {/* <div>{JSON.stringify(data_fields)}</div> */}
      {/* <div>{resource_group}</div> */}
      {/* <div>{JSON.stringify(nested_data_items)}</div> */}
      {/* <div className="flex justify-end">
        <Button
          size="compact-xs"
          onClick={toggleAllRows}
          variant={expandedRecordIds.length === 0 ? "outline" : "filled"}
        >
          {expandedRecordIds.length === 0 ? "expand all" : "collapse all"}
        </Button>
      </div> */}
      {/* <div>{JSON.stringify(sorting)}</div> */}

      {tableInstance && tableInstance.getVisibleFlatColumns() && (
        <DataTable<T>
          // page={1}
          // onPageChange={(page) => console.log(page)}
          // recordsPerPage={10}
          storeColumnsKey={key}
          // columns={effectiveColumns as DataTableColumn<T>[]}
          columns={currentColumns}
          // records={tableInstance
          //   .getFilteredRowModel()
          //   .rows.map((row) => row.original)}
          {...(resource_group !== "summary" && { height: "60vh" })} // dynamically include or exclude height
          records={tableInstance
            .getSortedRowModel()
            .rows.map((row) => row.original)}
          sortStatus={localSortStatus}
          onSortStatusChange={customSetSorting}
          highlightOnHover={true}
          withColumnBorders={true}
          pinFirstColumn={true}
          textSelectionDisabled={isTouch} // 👈 disable text selection on touch devices
          pinLastColumn={true}
          striped={true}
          // totalRecords={data_items.length}
          // height="70dvh"
          // minHeight={400}
          // 75% of the viewport height as the maximum height
          maxHeight={height * 0.75}
          fz="xs"
          selectedRecords={selectedRecords[resource_group] ?? []}
          onSelectedRecordsChange={handleSelectValue}
          // defaultColumnRender={(row, _, accessor) => {
          //   const data = row[accessor as keyof typeof row];
          //   return typeof data === "string" ? data : JSON.stringify(data);
          //   return <div>hello world</div>;
          // }}
          onRowClick={({ record, index, event }) => {
            setActiveRecord(record);
            // if (resource_group === "action_steps") {
            //   setActiveAction(record);
            // }
          }}
          onRowContextMenu={({ record, event }) =>
            showContextMenu([
              {
                key: "copy-record-to-clipboard",
                icon: <IconCopy size={16} />,
                onClick: () => clipboard.copy(record),
                // showNotification({
                //   message: `Clicked on view context-menu action for ${record.name} company`,
                //   withBorder: true,
                // }),
              },
            ])(event)
          }
          onCellClick={({ event, record, index, column, columnIndex }) => {
            // console.log("cell value clicked", record[column?.accessor]);
            clipboard.copy(record[column?.accessor]);
          }}
          rowExpansion={{
            allowMultiple: true,
            initiallyExpanded: ({ record: { id } }) => id === "issues",
            expanded: {
              recordIds: [
                "issues",
                "payment_analysis",
                "supplier_analysis",
                ...expandedRecordIds,
              ],
              onRecordIdsChange: setExpandedRecordIds,
            },
            content: ({ record, collapse }) => (
              <>
                {nested_data_items ? (
                  <DataTable
                    noHeader
                    withColumnBorders
                    columns={[
                      ...(tableInstance
                        ?.getVisibleFlatColumns()
                        ?.map((column, index) => {
                          return {
                            id: column.id,
                            accessor: column.columnDef.header,
                            render: (record: T) => {
                              const value =
                                record[column.columnDef.header as keyof T];

                              if (
                                typeof value === "string" &&
                                ["record_id", "id", "name"].includes(
                                  String(column.columnDef.header)
                                )
                              ) {
                                // If value is a string, render it inside a div
                                return (
                                  <div className="flex">
                                    <IconChevronRight
                                      className={clsx(
                                        classes.icon,
                                        classes.expandIcon,
                                        {
                                          [classes.expandIconRotated]:
                                            nestedExpandedRecordIds.includes(
                                              value
                                            ),
                                        }
                                      )}
                                    />
                                    <div>{value}</div>
                                  </div>
                                );
                              } else if (
                                typeof value === "string" &&
                                !["record_id", "id", "name"].includes(
                                  String(column.columnDef.header)
                                )
                              ) {
                                // If value is a string, render it inside a div
                                return <div>{value}</div>;
                              } else if (typeof value === "object") {
                                // If value is an object, render it as JSON
                                return <div>{JSON.stringify(value)}</div>;
                              } else {
                                // If the value is neither, render it directly
                                return <div>{String(value)}</div>;
                              }
                            },
                            // render: column.columnDef.cell,
                            // sortable: column.getCanSort(),
                            width: 300,
                            sortable: true,
                            noWrap: true,
                          } as DataTableColumn<T>;
                        })
                        .filter((column) => {
                          return data_fields
                            .map((item) => item?.name)
                            .includes(String(column?.accessor));
                        }) || []),
                    ]}
                    records={tableInstance
                      ?.getFilteredRowModel()
                      .rows.map((row) => row.original)
                      .filter((item) => item?.id === record.id)}
                    fz="xs"
                    selectedRecords={selectedRecords[resource_group] ?? []}
                    onSelectedRecordsChange={handleSelectValue}
                    striped={true}
                    highlightOnHover={true}
                    rowExpansion={{
                      allowMultiple: true,
                      initiallyExpanded: ({ record: { state } }) => true,
                      expanded: {
                        recordIds: nestedExpandedRecordIds,
                        onRecordIdsChange: setNestedExpandedRecordIds,
                      },
                      content: ({ record, collapse }) => (
                        <>
                          {true ? (
                            <div
                              className={`${
                                isMobile ? "w-[400px]" : "w-full"
                              } max-w-full max-h-screen overflow-y-auto p-4`}
                            >
                              <MonacoEditor
                                value={record}
                                language="json"
                                height="25vh"
                              />
                            </div>
                          ) : null}
                        </>
                      ),
                    }}
                  />
                ) : (
                  <div
                    className={`${
                      isMobile ? "w-[400px]" : "w-full"
                    } max-w-full max-h-screen overflow-y-auto p-4`}
                  >
                    {/* <MonacoEditor
                      value={record}
                      language="json"
                      height="25vh"
                    /> */}
                    {/* Bar Chart Section */}
                    <Card shadow="sm" p="lg" className="bg-white mb-8">
                      <Text className="font-bold mb-4">
                        Issues by Resolution Status
                      </Text>
                      <div className="h-80">
                        <ResponsiveBar
                          data={[
                            { category: "closed", issues: 10 },
                            { category: "open", issues: 16 },
                            { category: "pending", issues: 4 },
                          ]}
                          keys={["issues"]}
                          indexBy="category"
                          margin={{ top: 40, right: 50, bottom: 50, left: 60 }}
                          colors={({ data }) => {
                            if (data.category === "closed") return "#66BB6A"; // Pleasant green
                            if (data.category === "open") return "#EF5350"; // Pleasant red
                            if (data.category === "pending") return "#FFA726"; // Pleasant orange
                            return "#888"; // Default color
                          }}
                          axisBottom={{
                            legend: "Category",
                            legendPosition: "middle",
                            legendOffset: 32,
                          }}
                          axisLeft={{ legend: "Issues", legendOffset: -40 }}
                        />
                      </div>
                    </Card>
                  </div>
                )}
              </>
            ),
          }}
        />
      )}
    </>
  );
}

export default TableView;

interface ColumnMeta {
  filter_variant?: string;
}

// function Filter<TData>({ column }: { column: Column<TData, unknown> }) {
//   const columnFilterValue = column.getFilterValue();
//   const { filter_variant } = (column.columnDef.meta as ColumnMeta) ?? {};

//   return filter_variant === "range" ? (
//     <div>
//       <div className="flex space-x-2">
//         <DebouncedInput
//           type="number"
//           value={(columnFilterValue as [number, number])?.[0] ?? ""}
//           onChange={(value) =>
//             column.setFilterValue((old: [number, number]) => [value, old?.[1]])
//           }
//           placeholder={`Min`}
//           className="w-24 border shadow rounded"
//         />
//         <DebouncedInput
//           type="number"
//           value={(columnFilterValue as [number, number])?.[1] ?? ""}
//           onChange={(value) =>
//             column.setFilterValue((old: [number, number]) => [old?.[0], value])
//           }
//           placeholder={`Max`}
//           className="w-24 border shadow rounded"
//         />
//       </div>
//       <div className="h-1" />
//     </div>
//   ) : filter_variant === "select" ? (
//     <select
//       onChange={(e) => column.setFilterValue(e.target.value)}
//       value={columnFilterValue?.toString()}
//     >
//       <option value="">All</option>
//       <option value="complicated">complicated</option>
//       <option value="relationship">relationship</option>
//       <option value="single">single</option>
//     </select>
//   ) : (
//     <DebouncedInput
//       className="w-36 border shadow rounded"
//       onChange={(value) => column.setFilterValue(value)}
//       placeholder={`Search...`}
//       type="text"
//       value={(columnFilterValue ?? "") as string}
//     />
//   );
// }

// function Filter<TData>({ column }: { column: Column<TData, unknown> }) {
//   const columnFilterValue = column.getFilterValue();
//   // const { filter_variant } = (column.columnDef.meta as ColumnMeta) ?? {};
//   return (
//     <>
//       {/* <div>{JSON.stringify(columnFilterValue)}</div> */}
//       <DebouncedInput
//         className="w-36 border shadow rounded"
//         onChange={(value) => column.setFilterValue(value)}
//         placeholder={`filter...`}
//         type="text"
//         value={(columnFilterValue ?? "") as string}
//       />
//     </>
//   );

//   // return filter_variant === "range" ? (
//   //   <div>
//   //     <div className="flex space-x-2">
//   //       <DebouncedInput
//   //         type="number"
//   //         value={(columnFilterValue as [number, number])?.[0] ?? ""}
//   //         onChange={(value) =>
//   //           column.setFilterValue((old: [number, number]) => [value, old?.[1]])
//   //         }
//   //         placeholder={`Min`}
//   //         className="w-24 border shadow rounded"
//   //       />
//   //       <DebouncedInput
//   //         type="number"
//   //         value={(columnFilterValue as [number, number])?.[1] ?? ""}
//   //         onChange={(value) =>
//   //           column.setFilterValue((old: [number, number]) => [old?.[0], value])
//   //         }
//   //         placeholder={`Max`}
//   //         className="w-24 border shadow rounded"
//   //       />
//   //     </div>
//   //     <div className="h-1" />
//   //   </div>
//   // ) : filter_variant === "select" ? (
//   //   <select
//   //     onChange={(e) => column.setFilterValue(e.target.value)}
//   //     value={columnFilterValue?.toString()}
//   //   >
//   //     <option value="">All</option>
//   //     <option value="complicated">complicated</option>
//   //     <option value="relationship">relationship</option>
//   //     <option value="single">single</option>
//   //   </select>
//   // ) : (
//   //   <DebouncedInput
//   //     className="w-36 border shadow rounded"
//   //     onChange={(value) => column.setFilterValue(value)}
//   //     placeholder={`Search...`}
//   //     type="text"
//   //     value={(columnFilterValue ?? "") as string}
//   //   />
//   // );
// }

// Updated Filter component
function Filter<TData>({
  column,
  field,
}: {
  column: Column<TData, unknown>;
  field: any;
}) {
  const columnFilterValue = column.getFilterValue();

  // Conditionally render filters based on data_type
  if (field.data_type === "datethime") {
    return (
      <DatePicker
        placeholder="Pick date"
        value={columnFilterValue ? new Date(columnFilterValue as string) : null}
        onChange={(value) =>
          column.setFilterValue(value?.toISOString() ?? null)
        }
        // className="w-36 border shadow rounded"
      />
    );
  } else if (field.data_type === "string") {
    return (
      <DebouncedInput
        className="w-36 border shadow rounded"
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search...`}
        type="text"
        value={(columnFilterValue ?? "") as string}
      />
    );
  } else if (field.data_type === "float" || field.data_type === "integer") {
    return (
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max`}
          className="w-24 border shadow rounded"
        />
      </div>
    );
  } else {
    // Default filter (e.g., for complex types)
    return (
      <DebouncedInput
        className="w-36 border shadow rounded"
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search...`}
        type="text"
        value={(columnFilterValue ?? "") as string}
      />
    );
  }
}
