import { ResultsComponentProps } from "@components/interfaces";
import React from "react";
// import { useViewportSize } from "@mantine/hooks";
// import { flexRender } from "@tanstack/react-table";
// import { Table as TanStackTable } from "@tanstack/react-table";
// import { DataTable } from "mantine-datatable";
// import { useState } from "react";
// import { getColumnIdWithoutResourceGroup } from "src/utils";
// import { Column } from "@tanstack/react-table";

export function HeroView<T extends Record<string, any>>({
  tableInstance,
  data_columns,
  data_items,
  resource_group,
}: ResultsComponentProps<T>) {
  // Define pixels per character (adjust as needed)
  // const pixelsPerChar = 10; // Example value
  // const { height, width } = useViewportSize();
  // const [selectedRecords, setSelectedRecords] = useState<T[]>([]);

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
  return (
    <>
      <div>heroview</div>
    </>
  );
}
export default HeroView;
