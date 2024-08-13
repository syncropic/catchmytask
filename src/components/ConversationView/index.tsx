import { ResultsComponentProps } from "@components/interfaces";
import { useViewportSize } from "@mantine/hooks";
import { flexRender } from "@tanstack/react-table";
import { Table as TanStackTable } from "@tanstack/react-table";
import { DataTable } from "mantine-datatable";
import { useState } from "react";
import { getColumnIdWithoutResourceGroup } from "src/utils";
import { Column } from "@tanstack/react-table";
import React from "react";
import MonacoEditor from "@components/MonacoEditor";
import { Avatar, ScrollArea } from "@mantine/core";

export function ConversationView<T extends Record<string, any>>({
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
  // console.log("filteredRows", filteredRows);
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
      {/* <DataTable
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
      /> */}
      {/* <MonacoEditor
        value={tableInstance
          ?.getFilteredRowModel()
          .rows.map((row) => row.original)}
        language="json"
        height="100vh"
      /> */}

      <ChatContainer
        messages={
          tableInstance
            ?.getFilteredRowModel()
            .rows.map((row) => row.original) as unknown as Message[]
        }
      />
      {/* <div>conversationview</div> */}
    </>
  );
}
export default ConversationView;

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

export interface Message {
  author_id: string;
  author_role: string;
  created_datetime: string;
  output: {
    content: string;
  };
}

const ChatContainer = ({ messages }: { messages: Message[] }) => {
  return (
    <div className="bg-gray-100 flex flex-col">
      <ScrollArea h={250}>
        {/* Message List */}
        <div className="flex-1 overflow-y-auto">
          {messages?.map((message) => (
            <ChatMessage message={message} />
          ))}
        </div>
      </ScrollArea>

      {/* Message Templates */}
      {/* <MessageTemplatesContainer templates={message_templates} /> */}

      {/* Message Input */}
      {/* <div className="bg-white p-4 border-t border-gray-200">
        <MessageInput />
      </div> */}
    </div>
  );
};

const ChatMessage = ({ message }: { message: Message }) => {
  return (
    <div className="w-full border-b border-gray-300">
      <div
        className={`rounded-t-sm px-4 py-2 ${
          message?.author_role == "user"
            ? "bg-gray-200 text-black"
            : "bg-gray-100 text-black"
        }`}
      >
        <div className="flex justify-center">
          <div className="max-w-xl w-full">
            <div></div> {/* Left empty column */}
            <div className="flex items-start space-x-2">
              {/* Avatar */}
              {/* <img
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80"
                alt="avatar"
                className="w-6 h-6 rounded-full mt-1"
              /> */}
              <Avatar src={""} radius="xl" />
              {/* Message */}
              <div className="flex-col">
                <div className="flex">
                  <span className="text-sm align-top">
                    {JSON.stringify(message?.author_id)}
                  </span>
                  <span className="text-sm align-top">
                    {JSON.stringify(message?.created_datetime)}
                  </span>
                </div>
                <span className="text-sm align-top">
                  {JSON.stringify(message?.output?.content)}
                </span>
              </div>
            </div>
            <div></div> {/* Right empty column */}
          </div>
        </div>
      </div>
    </div>
  );
};
