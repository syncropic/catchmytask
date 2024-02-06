import {
  IResourceComponentsProps,
  useShow,
  useOne,
  useCustomMutation,
} from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/mantine";
import { Accordion, Anchor, Flex, MantineProvider, Title } from "@mantine/core";
import React, { useMemo, useState } from "react";
import { GetManyResponse, useMany, useList, HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconEdit,
  IconList,
  IconMathFunction,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
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
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
} from "mantine-react-table";
import { useParsed } from "@refinedev/core";
import { addSeparator, formatDateTimeAsDate } from "src/utils";
import CodeBlock from "src/components/codeblock/codeblock";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ListMessages from "@components/message/ListItems";
import WriteMessagesForm from "@components/message/WriteItemForm";
import { parseISO, format } from "date-fns";
import { useInvalidate } from "@refinedev/core";

// Define the data structure
interface ICaesarsBooking {
  id: string;
  name: string;
  // lead_passenger_name: string;
  // pnr: string;
  // schedule_change_remarks: string;
  // old_pnr_text: string;
  // new_pnr_text: string;
  // package_id: string;
}

interface IActionStep {
  [key: string]: any;
}

interface IReportOption {
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

const CreateAndSaveToRemoteComponent = (data_item: any) => {
  let data = data_item?.data;
  // Function to extract download_link and webUrl (remote_link)
  const extractLinks = (data: any) => {
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
        <strong>Remote Link:</strong>{" "}
        <a href={remoteLink} target="_blank" rel="noopener noreferrer">
          {remoteLink}
        </a>
      </p>
      <p className="break-words">
        <strong>Download Link:</strong>{" "}
        <a href={downloadLink} target="_blank" rel="noopener noreferrer">
          {downloadLink}
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
  const invalidate = useInvalidate();

  const { mutate, isLoading: mutationIsLoading, isError } = useCustomMutation();

  const { id } = useParsed();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  // report_options data
  const {
    data: reportOptionData,
    isLoading: isLoadingReportOptionData,
    isError: isErrorReportOptionData,
  } = useOne<IReportOption, HttpError>({
    resource: "report_options",
    id: record?.report_options,
  });

  const report_option = reportOptionData?.data ?? [];
  // console.log("report_option", report_option);

  // additions
  const {
    data: executeData,
    isLoading: isLoadingExecuteData,
    isError: isErrorExecuteData,
  } = useList({
    resource: "execute",
    filters: [
      {
        field: "record",
        operator: "eq",
        value: addSeparator(id, "reports"),
      },
    ],
  });

  // Example data
  const execute_data = executeData?.data ?? [];
  // console.log(execute_data);
  const columns = useMemo<MRT_ColumnDef<IActionStep>[]>(
    () => [
      // { accessorKey: "id", header: "id" },
      {
        id: "actions",
        accessorKey: "id",
        enableColumnFilter: false,
        header: "quick actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <Button
              size="xs"
              variant="outline"
              color={row.original.status === "complete" ? "green" : "blue"}
              onClick={() =>
                mutate({
                  url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
                  method: "post",
                  values: {
                    ...report_option,
                    task_input: {
                      ...report_option?.task_input,
                      create_email_message_1: {
                        email_type: record?.email_type,
                        personal_message: record?.personal_message,
                        internal_message: record?.internal_message,
                      },
                      send_email_message_1: {
                        mail_list: record?.mail_list,
                      },
                      generate_sql_query_1: {
                        text_query:
                          report_option?.task_input?.generate_sql_query_1?.text_query
                            ?.replace(
                              "${start_date}",
                              formatDateTimeAsDate(record?.start_date)
                            )
                            .replace(
                              "${end_date}",
                              formatDateTimeAsDate(record?.end_date)
                            ),
                      },
                      generate_sql_query_2: {
                        text_query:
                          report_option?.task_input?.generate_sql_query_2?.text_query
                            ?.replace(
                              "${start_date}",
                              formatDateTimeAsDate(record?.start_date)
                            )
                            .replace(
                              "${end_date}",
                              formatDateTimeAsDate(record?.end_date)
                            ),
                      },
                    },
                    options: {
                      ...report_option?.options,
                      execution_orders_range: [
                        row.original.execution_order,
                        row.original.execution_order,
                      ],
                      create_database_record: false,
                    },
                    task: {
                      ...report_option?.task,
                      id: row.original.in,
                    },
                    values: {
                      ...record,
                      resource: "reports",
                      // author: identity?.email,
                      // report_options: addSeparator(activeItem?.id, "report_options"),
                    },
                  },
                  successNotification: (data, values) => {
                    invalidate({
                      resource: "execute",
                      invalidates: ["list"],
                    });
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
            <Button onClick={handleComingSoon} size="xs" variant="outline">
              Configure
            </Button>
          </Group>
        ),
      },

      { accessorKey: "name", header: "name" },
      { accessorKey: "kind", header: "kind" },
      { accessorKey: "status", header: "status" },
      { accessorKey: "execution_order", header: "execution_order" },
      { accessorKey: "in", header: "task" },
      { accessorKey: "out", header: "function" },
      {
        accessorKey: "created_at",
        header: "created_at",
        Cell: ({ row }) => (
          <Text size="sm">
            {format(parseISO(row.original.created_at), "yyyy-MM-dd hh:mm a")}
          </Text>
        ),
      },
      {
        accessorKey: "updated_at",
        header: "updated_at",
        Cell: ({ row }) => (
          <Text size="sm">
            {format(parseISO(row.original.updated_at), "yyyy-MM-dd hh:mm a")}
          </Text>
        ),
      },
    ],
    []
  );
  // useMantineReactTable hook
  const table = useMantineReactTable({
    columns,
    enableRowSelection: true,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    // enableRowActions: true,
    enableStickyHeader: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enablePinning: true,
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "md",
    },
    mantineSearchTextInputProps: {
      placeholder: "Search Actions",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    state: { isLoading: mutationIsLoading },
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
      <div>
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
    renderTopToolbar: ({ table }) => {
      const handleDeactivate = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("deactivating " + row.getValue("name"));
        });
      };

      const handleDelete = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          console.log("deleting " + row.getValue("id"));
        });
      };
      const handleRun = () => {
        // Step 1: Make a copy of flatRows and sort it
        const sortedRows = [...table.getSelectedRowModel().flatRows].sort(
          (a, b) => {
            return a.original.execution_order - b.original.execution_order;
          }
        );

        sortedRows.forEach((row) => {
          console.log(
            "running " + row.original.name + " " + row.original.execution_order
          );
          mutate({
            url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
            method: "post",
            values: {
              ...report_option,
              task_input: {
                ...report_option?.task_input,
                create_email_message_1: {
                  email_type: record?.email_type,
                  personal_message: record?.personal_message,
                  internal_message: record?.internal_message,
                },
                send_email_message_1: {
                  mail_list: record?.mail_list,
                },
                generate_sql_query_1: {
                  text_query:
                    report_option?.task_input?.generate_sql_query_1?.text_query
                      ?.replace(
                        "${start_date}",
                        formatDateTimeAsDate(record?.start_date)
                      )
                      .replace(
                        "${end_date}",
                        formatDateTimeAsDate(record?.end_date)
                      ),
                },
                generate_sql_query_2: {
                  text_query:
                    report_option?.task_input?.generate_sql_query_2?.text_query
                      ?.replace(
                        "${start_date}",
                        formatDateTimeAsDate(record?.start_date)
                      )
                      .replace(
                        "${end_date}",
                        formatDateTimeAsDate(record?.end_date)
                      ),
                },
              },
              options: {
                ...report_option?.options,
                execution_orders_range: [
                  row.original.execution_order,
                  row.original.execution_order,
                ],
                create_database_record: false,
              },
              task: {
                ...report_option?.task,
                id: row.original.in,
              },
              values: {
                ...record,
                resource: "reports",
                // author: identity?.email,
                // report_options: addSeparator(activeItem?.id, "report_options"),
              },
            },
            successNotification: (data, values) => {
              invalidate({
                resource: "execute",
                invalidates: ["list"],
              });
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
          });
        });
      };

      return (
        <Flex p="md" justify="space-between">
          <Flex gap="xs">
            {/* import MRT sub-components */}
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected() || mutationIsLoading}
              onClick={handleDelete}
              variant="filled"
            >
              Delete
            </Button>
            <Button
              color="green"
              disabled={!table.getIsSomeRowsSelected() || mutationIsLoading}
              onClick={handleRun}
              variant="filled"
            >
              Run
            </Button>
          </Flex>
        </Flex>
      );
    },
  });
  const handleComingSoon = () => {
    alert("Coming Soon");
  };

  return (
    <>
      <Show isLoading={isLoading}>
        <Text>
          <b>Id:</b> {record?.id}
        </Text>
        <Text>
          <b>Name:</b> {record?.name}
        </Text>
        <Accordion defaultValue="actions">
          <Accordion.Item key="details" value="details">
            <Accordion.Control icon={<IconList />}>
              More details
            </Accordion.Control>
            <Accordion.Panel>
              <CodeBlock jsonData={data} />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key="actions" value="actions">
            <Accordion.Control icon={<IconMathFunction />}>
              Actions
            </Accordion.Control>
            <Accordion.Panel>
              <MantineProvider
                theme={{
                  colorScheme: "light",
                  primaryColor: "blue",
                }}
              >
                <MantineReactTable table={table} />
              </MantineProvider>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Show>
    </>
  );
};
export default PageShow;
