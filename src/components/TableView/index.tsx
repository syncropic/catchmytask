import { ResultsComponentProps } from "@components/interfaces";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import { flexRender } from "@tanstack/react-table";
import { Table as TanStackTable, ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DataTableColumn,
  DataTableSortStatus,
} from "mantine-datatable";
import { useEffect, useState } from "react";
import { getColumnIdWithoutResourceGroup } from "src/utils";
import { Column } from "@tanstack/react-table";
import React from "react";
import { DebouncedInput } from "@components/Utils";
import { ActionIcon, Box, Group, Tooltip } from "@mantine/core";
import { useAppStore } from "src/store";
import RecordActionsWrapper from "@components/RecordActions";
import { sortBy } from "lodash";
import ActionStepEditor from "@components/ActionStepEditor";
import MonacoEditor from "@components/MonacoEditor";
import { IconChevronRight } from "@tabler/icons-react";
import clsx from "clsx";
import classes from "./NestedTablesExample.module.css";
import { access } from "fs";
import { render } from "react-dom";

const PAGE_SIZES = [10, 15, 20];

export function TableView<T extends Record<string, any>>({
  tableInstance,
  nested_data_items,
  resource_group,
  data_fields,
  ui,
  execlude_components,
  invalidate_queries_on_submit_success,
}: ResultsComponentProps<T>) {
  // const [selectedRecords, setSelectedRecords] = useState<T[]>([]);
  const {
    setActiveRecord,
    setActiveAction,
    selectedRecords,
    setSelectedRecords,
  } = useAppStore();
  // Media query for screens smaller than 640px (mobile devices)
  const isMobile = useMediaQuery("(max-width: 640px)");

  // let columns_to_filter_out = ["select", "actions", "details"];

  const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);
  const [nestedExpandedRecordIds, setNestedExpandedRecordIds] = useState<
    string[]
  >([]);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<T>>({
    columnAccessor: "execution_order",
    direction: "asc",
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

  return (
    <>
      {/* <MonacoEditor value={data_items} language="json" height="50vh" /> */}
      {/* <div>{JSON.stringify(tableInstance?.getVisibleFlatColumns())}</div> */}
      {/* <div>{JSON.stringify(data_fields)}</div> */}

      {tableInstance && tableInstance.getVisibleFlatColumns() && (
        <DataTable<T>
          // page={1}
          // onPageChange={(page) => console.log(page)}
          // recordsPerPage={10}

          columns={tableInstance
            .getVisibleFlatColumns()
            .map((column) => {
              return {
                id: column.id,
                accessor: column.columnDef.header,
                width: 300,
                render: (record: T) => {
                  const value = record[column.columnDef.header as keyof T];

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
                          className={clsx(classes.icon, classes.expandIcon, {
                            [classes.expandIconRotated]:
                              expandedRecordIds.includes(value),
                          })}
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
                sortable: true,
                // sortable: column.getCanSort(),
                // column.getCanFilter()
                filter: (
                  <>
                    {true ? (
                      <div>
                        <Filter column={column} />
                      </div>
                    ) : null}
                  </>
                ),
              } as DataTableColumn<T>;
            })
            .filter((column) => {
              return data_fields
                .map((item) => item?.name)
                .includes(String(column?.accessor));
            })}
          records={tableInstance
            .getFilteredRowModel()
            .rows.map((row) => row.original)}
          // records={records}
          // records={records}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          highlightOnHover={true}
          withColumnBorders={true}
          pinFirstColumn={true}
          // pinLastColumn={true}
          striped={true}
          // totalRecords={data_items.length}
          height="70dvh"
          minHeight={400}
          maxHeight={1000}
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
          rowExpansion={{
            allowMultiple: true,
            initiallyExpanded: ({ record: { state } }) => true,
            expanded: {
              recordIds: expandedRecordIds,
              onRecordIdsChange: setExpandedRecordIds,
            },
            content: ({ record, collapse }) => (
              <>
                {true ? (
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
                ) : null}
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

function Filter<TData>({ column }: { column: Column<TData, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  // const { filter_variant } = (column.columnDef.meta as ColumnMeta) ?? {};
  return (
    <>
      {/* <div>{JSON.stringify(columnFilterValue)}</div> */}
      <DebouncedInput
        className="w-36 border shadow rounded"
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`filter...`}
        type="text"
        value={(columnFilterValue ?? "") as string}
      />
    </>
  );

  // return filter_variant === "range" ? (
  //   <div>
  //     <div className="flex space-x-2">
  //       <DebouncedInput
  //         type="number"
  //         value={(columnFilterValue as [number, number])?.[0] ?? ""}
  //         onChange={(value) =>
  //           column.setFilterValue((old: [number, number]) => [value, old?.[1]])
  //         }
  //         placeholder={`Min`}
  //         className="w-24 border shadow rounded"
  //       />
  //       <DebouncedInput
  //         type="number"
  //         value={(columnFilterValue as [number, number])?.[1] ?? ""}
  //         onChange={(value) =>
  //           column.setFilterValue((old: [number, number]) => [old?.[0], value])
  //         }
  //         placeholder={`Max`}
  //         className="w-24 border shadow rounded"
  //       />
  //     </div>
  //     <div className="h-1" />
  //   </div>
  // ) : filter_variant === "select" ? (
  //   <select
  //     onChange={(e) => column.setFilterValue(e.target.value)}
  //     value={columnFilterValue?.toString()}
  //   >
  //     <option value="">All</option>
  //     <option value="complicated">complicated</option>
  //     <option value="relationship">relationship</option>
  //     <option value="single">single</option>
  //   </select>
  // ) : (
  //   <DebouncedInput
  //     className="w-36 border shadow rounded"
  //     onChange={(value) => column.setFilterValue(value)}
  //     placeholder={`Search...`}
  //     type="text"
  //     value={(columnFilterValue ?? "") as string}
  //   />
  // );
}
