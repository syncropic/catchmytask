// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@components/Table";
import { ResultsComponentProps } from "@components/interfaces";
import { useViewportSize } from "@mantine/hooks";
import { flexRender } from "@tanstack/react-table";
import { Table as TanStackTable, ColumnDef } from "@tanstack/react-table";
import { DataTable, DataTableColumn } from "mantine-datatable";
import { useState } from "react";
import { getColumnIdWithoutResourceGroup } from "src/utils";
import { Column } from "@tanstack/react-table";
import React from "react";
import { DebouncedInput } from "@components/Utils";
import ActionInput from "@components/ActionInput";
import ActionStepEditor from "@components/ActionStepEditor";
import { ActionIcon, Box, Group } from "@mantine/core";
import { useAppStore } from "src/store";

import {
  IconCursorText,
  IconEdit,
  IconEye,
  IconLock,
} from "@tabler/icons-react";

export function TableView<T extends Record<string, any>>({
  tableInstance,
  data_items,
  resource_group,
  ui,
}: ResultsComponentProps<T>) {
  // Define pixels per character (adjust as needed)
  const pixelsPerChar = 10; // Example value
  const { height, width } = useViewportSize();
  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);
  const { setActiveRecord } = useAppStore();

  // Function to calculate width based on the number of characters
  // const calculateWidth = (header) => {
  //   const charCount = header.column.columnDef.header.length;
  //   return charCount * pixelsPerChar;
  // };

  // Function to get the section of the columnId that comes after the resource group prefix
  // let columns = data_columns.map((column) => {
  //   return {
  //     accessor:
  //       column?.accessor ||
  //       getColumnIdWithoutResourceGroup(column?.id, resource_group),
  //     id: column?.id,
  //     // Header: column,
  //     // width: 100,
  //   };
  // });
  // let visibleTableColumns = tableInstance?.getVisibleFlatColumns();
  // // console.log("visibleFlatColumns", visibleTableColumns);
  let columns_to_filter_out = ["select", "actions", "details"];
  // columns = visibleTableColumns.filter((column) => {
  //   return !columns_to_filter_out.includes(column.accessor);
  // });
  // {table.getRowModel().rows.map(row => {
  //   return (
  //     <tr key={row.id}>
  //       {row.getVisibleCells().map(cell => {
  //         return (
  //           <td key={cell.id}>
  //             {flexRender(
  //               cell.column.columnDef.cell,
  //               cell.getContext()
  //             )}
  //           </td>
  //         )
  //       })}
  //     </tr>
  //   )
  // })}
  let filteredRows = tableInstance
    ?.getFilteredRowModel()
    .rows.map((row) => row.original);
  // console.log("filteredRows", filteredRows);
  // return <div>{JSON.stringify(tableInstance?.getVisibleFlatColumns())}</div>;

  let additional_default_columns = [
    {
      accessor: "actions",
      // title: <Box mr={6}>Row actions</Box>,
      // textAlign: 'right',
      // render: (company) => (
      //   <Group gap={4} justify="right" wrap="nowrap">
      //     <ActionIcon
      //       size="sm"
      //       variant="subtle"
      //       color="green"
      //       onClick={() => showModal({ company, action: 'view' })}
      //     >
      //       <IconEye size={16} />
      //     </ActionIcon>
      //     <ActionIcon
      //       size="sm"
      //       variant="subtle"
      //       color="blue"
      //       onClick={() => showModal({ company, action: 'edit' })}
      //     >
      //       <IconEdit size={16} />
      //     </ActionIcon>
      //     <ActionIcon
      //       size="sm"
      //       variant="subtle"
      //       color="red"
      //       onClick={() => showModal({ company, action: 'delete' })}
      //     >
      //       <IconTrash size={16} />
      //     </ActionIcon>
      //   </Group>
      // ),
    },
  ];

  return (
    <>
      {/* {JSON.stringify(
        visibleTableColumns
          ?.map((column) => {
            return {
              id: column.id,
              accessor:
                column.accessor ||
                getColumnIdWithoutResourceGroup(column.id, resource_group),
            };
          })
          .filter((column) => {
            return !columns_to_filter_out.includes(column.accessor);
          })
      )} */}
      <DataTable<T>
        // columns={[]}
        columns={[
          ...(tableInstance
            ?.getVisibleFlatColumns()
            ?.map((column) => {
              return {
                id: column.id,
                accessor: column.columnDef.header,
                // accessor:
                //   column?.accessorFn ||
                //   getColumnIdWithoutResourceGroup(column.id, resource_group),
                render: column.columnDef.cell,
                sortable: column.getCanSort(),
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
            // id: 'actions',
            accessor: "actions",
            title: <Box mr={6}>actions</Box>,
            textAlign: "right",
            render: (company: T) => (
              <Group gap={4} justify="right" wrap="nowrap">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="green"
                  // onClick={() => showModal({ company, action: 'view' })}
                >
                  <IconLock size={12} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="green"
                  // onClick={() => showModal({ company, action: 'view' })}
                >
                  <IconCursorText size={12} />
                </ActionIcon>
                {/* <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="blue"
                  // onClick={() => showModal({ company, action: 'edit' })}
                >
                  <IconEdit size={16} />
                </ActionIcon> */}
                {/* <ActionIcon
                    size="sm"
                    variant="subtle"
                    color="red"
                    onClick={() => showModal({ company, action: 'delete' })}
                  >
                    <IconTrash size={16} />
                  </ActionIcon> */}
              </Group>
            ),
          },
        ]} // Assign an empty array as the default value for columns
        records={
          (tableInstance
            ?.getFilteredRowModel()
            .rows?.map((row) => row.original) as T[]) || []
        }
        highlightOnHover={true}
        withColumnBorders={true}
        striped={true}
        // height={height - 200}
        fz="xs"
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
        defaultColumnRender={(row, _, accessor) => {
          const data = row[accessor as keyof typeof row];
          return typeof data === "string" ? data : JSON.stringify(data);
        }}
        onRowClick={({ record, index, event }) => {
          // console.log("onRowClick", record, index, event);
          setActiveRecord(record);
        }}
        rowExpansion={{
          // trigger: ui?.rowExpansionTrigger,
          allowMultiple: true,
          content: ({ record, collapse }) => (
            // <CompanyEditor
            //   initialData={record}
            //   onDone={(data) => {
            //     const index = companies.findIndex((c) => c.id === data.id);
            //     setCompanies([...companies.slice(0, index), data, ...companies.slice(index + 1)]);
            //     collapse(); // 👈 collapse the row after editing
            //   }}
            //   onCancel={collapse} // 👈 collapse the row if editing is cancelled
            // />
            // <div>{JSON.stringify(record)}</div>
            // <ActionInput></ActionInput>
            <ActionStepEditor record={record}></ActionStepEditor>
          ),
        }}
      />
      {/* <div>table</div> */}
    </>
  );
}
export default TableView;

{
  /* <TableBody>
{tableInstance.getRowModel().rows?.length ? (
  tableInstance.getRowModel().rows.map((row) => (
    <TableRow
      key={row.id}
      data-state={row.getIsSelected() && "selected"}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  ))
) : (
  <TableRow>
    <TableCell
      colSpan={data_columns.length}
      className="h-24 text-center"
    >
      No results.
    </TableCell>
  </TableRow>
)}
</TableBody> */
}

interface ColumnMeta {
  filter_variant?: string;
}

function Filter<TData>({ column }: { column: Column<TData, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filter_variant } = (column.columnDef.meta as ColumnMeta) ?? {};

  return filter_variant === "range" ? (
    <div>
      <div className="flex space-x-2">
        {/* See faceted column filters example for min max values functionality */}
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
      {/* See faceted column filters example for dynamic select options */}
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
    // See faceted column filters example for datalist search suggestions
  );
}
