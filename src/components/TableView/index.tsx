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
import { Table as TanStackTable } from "@tanstack/react-table";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { getColumnIdWithoutResourceGroup } from "src/utils";
import { Column } from "@tanstack/react-table";
import React from "react";

export function TableView<T extends Record<string, any>>({
  tableInstance,
  data_columns,
  data_items,
  resource_group,
}: ResultsComponentProps<T>) {
  // Define pixels per character (adjust as needed)
  const pixelsPerChar = 10; // Example value
  const { height, width } = useViewportSize();
  const [selectedRecords, setSelectedRecords] = useState<T[]>([]);

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
  console.log("filteredRows", filteredRows);
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
      <DataTable
        columns={tableInstance
          ?.getVisibleFlatColumns()
          ?.map((column) => {
            return {
              id: column.id,
              accessor:
                column?.accessor ||
                getColumnIdWithoutResourceGroup(column.id, resource_group),
              sortable: column.getCanSort(),
              filter: (
                <>
                  {column.getCanFilter() ? (
                    <div>
                      <Filter column={column} />
                    </div>
                  ) : null}
                  {/* <div>{JSON.stringify(column.getCanFilter())}</div> */}
                </>
              ),
            };
          })
          .filter((column) => {
            return !columns_to_filter_out.includes(column.accessor);
          })}
        records={tableInstance
          ?.getFilteredRowModel()
          .rows.map((row) => row.original)}
        highlightOnHover={true}
        withColumnBorders={true}
        height={height - 200}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
      />
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

function Filter({ column }: { column: Column<any, unknown> }) {
  const columnFilterValue = column.getFilterValue();
  const { filterVariant } = column.columnDef.meta ?? {};

  return filterVariant === "range" ? (
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
  ) : filterVariant === "select" ? (
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
