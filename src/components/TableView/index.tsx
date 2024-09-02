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

const PAGE_SIZES = [10, 15, 20];

export function TableView<T extends Record<string, any>>({
  tableInstance,
  data_items,
  resource_group,
  ui,
  execlude_components,
  invalidate_queries_on_submit_success,
}: ResultsComponentProps<T>) {
  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);
  const { setActiveRecord, setActiveAction } = useAppStore();
  // Media query for screens smaller than 640px (mobile devices)
  const isMobile = useMediaQuery("(max-width: 640px)");

  let columns_to_filter_out = ["select", "actions", "details"];

  const [expandedRecordIds, setExpandedRecordIds] = useState<string[]>([]);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<T>>({
    columnAccessor: "execution_order",
    direction: "asc",
  });
  const [records, setRecords] = useState(
    sortBy(
      tableInstance?.getFilteredRowModel().rows?.map((row) => row.original),
      "execution_order"
    ) as T[]
  );

  useEffect(() => {
    const data = sortBy(
      tableInstance?.getFilteredRowModel().rows?.map((row) => row.original),
      sortStatus.columnAccessor
    ) as T[];
    setRecords(sortStatus.direction === "desc" ? data.reverse() : data);
  }, [sortStatus]);

  return (
    <>
      <DataTable<T>
        // page={1}
        // onPageChange={(page) => console.log(page)}
        // recordsPerPage={10}
        columns={[
          ...(tableInstance
            ?.getVisibleFlatColumns()
            ?.map((column, index) => {
              return {
                id: column.id,
                accessor: column.columnDef.header,
                render: column.columnDef.cell,
                // sortable: column.getCanSort(),
                // width: 20,
                sortable: true,
                // thProps: { style: { maxWidth: 20 } },
                // tdProps: {
                //   style: {
                //     maxWidth: 20,
                //     overflow: "hidden",
                //     textOverflow: "ellipsis",
                //     whiteSpace: "nowrap",
                //   },
                // },
                filter: (
                  <>
                    {column.getCanFilter() ? (
                      <div>
                        <Filter column={column} />
                      </div>
                    ) : null}
                  </>
                ),
              } as DataTableColumn<T>;
            })
            .filter((column) => {
              return !columns_to_filter_out.includes(String(column?.accessor));
            }) || []),
          {
            accessor: "actions",
            title: <Box mr={6}>actions</Box>,
            textAlign: "right",
            // width: "0%", // 👈 set width to 0%
            width: 60,
            render: (record: T) => (
              <RecordActionsWrapper
                record={record}
                name="action_step"
                query_name="data_model"
                success_message_code="action_input_data_model_schema"
                setExpandedRecordIds={setExpandedRecordIds}
                invalidate_queries_on_submit_success={
                  invalidate_queries_on_submit_success
                }
              ></RecordActionsWrapper>
            ),
          },
        ]}
        records={records}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        highlightOnHover={true}
        withColumnBorders={true}
        pinFirstColumn={true}
        pinLastColumn={true}
        striped={true}
        // totalRecords={data_items.length}
        fz="xs"
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
        // defaultColumnRender={(row, _, accessor) => {
        //   const data = row[accessor as keyof typeof row];
        //   return typeof data === "string" ? data : JSON.stringify(data);
        // }}
        onRowClick={({ record, index, event }) => {
          setActiveRecord(record);
          if (resource_group === "action_steps") {
            setActiveAction(record);
          }
        }}
        rowExpansion={{
          allowMultiple: true,
          initiallyExpanded: ({ record: { state } }) => true,
          expanded: {
            recordIds: expandedRecordIds,
            onRecordIdsChange: setExpandedRecordIds,
          },
          content: ({ record, collapse }) => (
            <div
              className={`${
                isMobile ? "w-[400px]" : "w-full"
              } max-w-full max-h-screen overflow-y-auto p-4`}
            >
              <ActionStepEditor
                record={record}
                setExpandedRecordIds={setExpandedRecordIds}
                invalidate_queries_on_submit_success={
                  invalidate_queries_on_submit_success
                }
              />
            </div>

            // <ActionStepEditor
            //   record={record}
            //   setExpandedRecordIds={setExpandedRecordIds}
            //   invalidate_queries_on_submit_success={
            //     invalidate_queries_on_submit_success
            //   }
            // ></ActionStepEditor>
            // <div>{JSON.stringify(record)}</div>
          ),
        }}
        // withTableBorder={true}
      />
    </>
  );
}

export default TableView;

interface ColumnMeta {
  filter_variant?: string;
}

function Filter<TData>({ column }: { column: Column<TData, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filter_variant } = (column.columnDef.meta as ColumnMeta) ?? {};

  return filter_variant === "range" ? (
    <div>
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
      <div className="h-1" />
    </div>
  ) : filter_variant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">All</option>
      <option value="complicated">complicated</option>
      <option value="relationship">relationship</option>
      <option value="single">single</option>
    </select>
  ) : (
    <DebouncedInput
      className="w-36 border shadow rounded"
      onChange={(value) => column.setFilterValue(value)}
      placeholder={`Search...`}
      type="text"
      value={(columnFilterValue ?? "") as string}
    />
  );
}
