import {
  IResourceComponentsProps,
  useShow,
  useOne,
  useCustomMutation,
} from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/mantine";
import { MantineProvider, Title } from "@mantine/core";
import React, { useMemo, useState } from "react";
import { GetManyResponse, useMany, useList, HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import { IconEdit, IconSend, IconTrash } from "@tabler/icons-react";
import {
  ScrollArea,
  Table,
  Pagination,
  Group,
  Menu,
  Box,
  ActionIcon,
  Text,
  Code,
  Button,
} from "@mantine/core";
import { List, EditButton, ShowButton, DeleteButton } from "@refinedev/mantine";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useParsed } from "@refinedev/core";
import { addSeparator } from "src/utils";
import CodeBlock from "src/components/codeblock/codeblock";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ListMessages from "@components/message/ListItems";
import WriteMessagesForm from "@components/message/WriteItemForm";

// Define the data structure
interface TableData {
  id: string;
  name: string;
  // published: boolean;
  // created_at: Date;
  // updated_at: Date;
  // description: string;
  // status: string;
}

interface IActionStep {
  [key: string]: any;
}

const SaveFunctionCallInfoComponent = ({ data }: { data: any }) => {
  // Custom rendering logic for 'save_function_call_info'
  return (
    <div>
      {/* Render the details of the data in a user-friendly format */}
      <CodeBlock jsonData={data} />
    </div>
  );
};

const CreateAndSaveToRemoteComponent = (data: any) => {
  // Function to extract download_link and webUrl (remote_link)
  const extractLinks = (data: IActionStep) => {
    const downloadLink = data?.remote_file?.download_link || "";
    let remoteLink = "";

    if (data?.remote_file?.link?.webUrl) {
      remoteLink = data.remote_file.link.webUrl;
    } else if (data?.remote_file?.shareable_link) {
      remoteLink = data.remote_file.shareable_link;
    } else if (data?.remote_file?.upload_error?.webUrl) {
      remoteLink = data.remote_file.upload_error.webUrl;
    } else if (data?.remote_file?.shareable_link_error?.link?.webUrl) {
      remoteLink = data.remote_file.shareable_link_error.link.webUrl;
    }

    return { downloadLink, remoteLink };
  };

  const { downloadLink, remoteLink } = extractLinks(data);

  return (
    <div>
      <p>
        <strong>Name: </strong>
        {data?.name}
      </p>
      <p className="break-words">
        <strong>Download Link:</strong>{" "}
        <a href={downloadLink} target="_blank" rel="noopener noreferrer">
          {downloadLink}
        </a>
      </p>
      <p className="break-words">
        <strong>Remote Link:</strong>{" "}
        <a href={remoteLink} target="_blank" rel="noopener noreferrer">
          {remoteLink}
        </a>
      </p>
    </div>
  );
};

const renderOperationDetails = (fileOperation: any, data: any) => {
  switch (fileOperation) {
    case "save_function_call_info":
      return <SaveFunctionCallInfoComponent data={data} />;
    case "create_and_save_to_remote":
      return <CreateAndSaveToRemoteComponent data={data} />;
    default:
      return <SaveFunctionCallInfoComponent data={data} />;
  }
};

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const {
    mutate,
    isLoading: isLoadingCustomMutation,
    isError,
  } = useCustomMutation();

  const { id } = useParsed();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  const {
    data: messagesData,
    isLoading: messagesIsLoading,
    isError: messagesIsError,
  } = useList({
    resource: "messages",
  });

  const messages = messagesData?.data ?? [];

  const { data: nameData, isLoading: nameIsLoading } = useOne({
    resource: "names",
    id: record?.name || "",
    queryOptions: {
      enabled: !!record,
    },
  });

  const { data: statusData, isLoading: statusIsLoading } = useOne({
    resource: "statuses",
    id: record?.status || "",
    queryOptions: {
      enabled: !!record,
    },
  });
  // additions
  const {
    data: executeData,
    isLoading: isLoadingExecuteData,
    isError: isErrorExecuteData,
  } = useList({
    resource: "execute",
    filters: [
      {
        field: "in",
        operator: "eq",
        value: addSeparator(id, "task"),
      },
    ],
  });

  // EXECUTE
  const executeRequestData = {
    task: {
      id: "task:⟨4eab1ed2-13a3-4781-b2ba-3f1694805cc5⟩",
    },
    options: {
      rerun_execution_orders: [],
      execution_orders_range: [1, 20],
      execute_by: "execution_orders_range",
      user_feedback: "continue",
    },
    task_input: {
      generate_sql_query_01: {
        text_query:
          "Retrieve all onewurld bookings from cyDashBoardSetupTable where reporting date is >= 2024-01-08 and <= 2024-01-08. The collection is onewurld",
      },
      create_email_message_01: {
        email_type: "personal",
        personal_message: "",
        internal_message: "",
      },
      send_email_message_01: {
        mail_list: "personal",
      },
    },
  };
  // Example data
  const execute_data = executeData?.data ?? [];
  const columns = useMemo<MRT_ColumnDef<IActionStep>[]>(
    () => [
      // { accessorKey: "id", header: "id" },
      {
        id: "actions",
        accessorKey: "id",
        header: "Row Actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <Button
              size="xs"
              variant="outline"
              onClick={() =>
                mutate({
                  url: `http://localhost/execute`,
                  method: "post",
                  values: {
                    ...executeRequestData,
                    task: {
                      id: addSeparator(row.original.id, "task"),
                    },
                  },
                  successNotification: (data, values) => {
                    return {
                      message: `${row.original.id} Successfully fetched.`,
                      description: "Success with no errors",
                      type: "success",
                    };
                  },
                  errorNotification: (data, values) => {
                    return {
                      message: `Something went wrong when getting ${row.original.id}`,
                      description: "Error",
                      type: "error",
                    };
                  },
                })
              }
            >
              Run
            </Button>
          </Group>
        ),
      },
      { accessorKey: "in", header: "task" },
      // { accessorKey: "out", header: "function" },
      { accessorKey: "name", header: "name" },
      { accessorKey: "kind", header: "kind" },
      { accessorKey: "status", header: "status" },
      { accessorKey: "execution_order", header: "execution_order" },

      // {
      //   accessorKey: "published",
      //   header: "Published",
      //   cellProps: (row) => ({ children: row.published ? "Yes" : "No" }),
      // },
      {
        accessorKey: "created_at",
        header: "created_at",
        Cell: ({ renderedCellValue, row }) => (
          <div>{row.original.created_at}</div>
        ),
      },
      {
        accessorKey: "updated_at",
        header: "updated_at",
        Cell: ({ renderedCellValue, row }) => (
          <div>{row.original.created_at}</div>
        ),
      },
      // { accessorKey: "description", header: "Description" },
      // { accessorKey: "status", header: "Status" },
    ],
    []
  );
  // useMantineReactTable hook
  const table = useMantineReactTable({
    columns,
    enableRowSelection: true,
    // enableRowActions: true,
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      sorting: [
        {
          id: "execution_order", // Column ID to sort by
          desc: false, // false for ascending, true for descending
        },
      ],
    },
    data: execute_data,
    renderDetailPanel: ({ row }) => (
      <div className="w-full max-w-screen-xl mx-auto">
        {row.original.results && row.original.results.items ? (
          row.original.results.items.map((item: any, index: any) => (
            <div key={index} className="w-full">
              {renderOperationDetails(item.file_operation, item)}
            </div>
          ))
        ) : (
          <Text>No results available.</Text>
        )}
      </div>
    ),
  });

  return (
    <>
      <Show isLoading={isLoading}>
        <Title my="xs" order={5}>
          Id
        </Title>
        <TextField value={record?.id} />
        <Title my="xs" order={5}>
          Name
        </Title>
        <TextField value={record?.name} />
      </Show>
      <MantineProvider
        theme={{
          colorScheme: "light",
          primaryColor: "blue",
        }}
      >
        <MantineReactTable table={table} />
      </MantineProvider>
    </>
  );
};
export default PageShow;
