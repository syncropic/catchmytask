import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/Table";
import { ResultsComponentProps } from "@components/interfaces";
import { flexRender } from "@tanstack/react-table";
import { Table as TanStackTable } from "@tanstack/react-table";

export function TableView<T extends Record<string, any>>({
  tableInstance,
  data_columns,
}: ResultsComponentProps<T>) {
  // Define pixels per character (adjust as needed)
  const pixelsPerChar = 10; // Example value

  // Function to calculate width based on the number of characters
  const calculateWidth = (header) => {
    const charCount = header.column.columnDef.header.length;
    return charCount * pixelsPerChar;
  };
  return (
    <>
      {" "}
      <div
        className="overflow-auto h-screen"
        style={{ height: "calc(100vh - 64px)" }}
      >
        <table>
          <thead>
            {tableInstance.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex">
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className="[&:has([role=checkbox])]:pr-0"
                      style={{ width: `${calculateWidth(header)}px` }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {/* {header.column.columnDef.header} */}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {tableInstance.getRowModel().rows?.length ? (
              tableInstance.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="flex"
                >
                  {row.getVisibleCells().map((cell) => {
                    const header = tableInstance
                      .getHeaderGroups()
                      .flatMap((group) => group.headers)
                      .find((h) => h.id === cell.column.id);
                    const width = calculateWidth(header);
                    return (
                      <td key={cell.id} style={{ width: `${width}px` }}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr className="flex">
                <td colSpan={data_columns.length} className="h-24 text-center">
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
