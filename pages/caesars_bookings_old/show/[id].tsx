import {
  IResourceComponentsProps,
  useShow,
  useOne,
  useCustomMutation,
  useDelete,
  useInvalidate,
} from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/mantine";
import {
  Accordion,
  Anchor,
  Flex,
  MantineProvider,
  Title,
  rem,
} from "@mantine/core";
import React, { useMemo, useState } from "react";
import { GetManyResponse, useMany, useList, HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconCirclePlus,
  IconEdit,
  IconList,
  IconMail,
  IconMathFunction,
  IconMessageCircle,
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
import { renderOperationDetails } from "src/components/actionstep";
import { useDisclosure } from "@mantine/hooks";
import { useAppStore } from "src/store";

// Define the data structure
interface ICaesarsBooking {
  id: string;
  name: string;
  lead_passenger_name: string;
  lead_passenger_email: string;
  pnr: string;
  schedule_change_remarks: string;
  old_pnr_text: string;
  new_pnr_text: string;
  package_id: string;
}

interface IActionStep {
  [key: string]: any;
}

interface IReportOption {
  [key: string]: any;
}

interface ITask {
  [key: string]: any;
}
export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const actionType = useAppStore((state) => state.actionType);
  const setActionType = useAppStore((state) => state.setActionType);
  const { mutate: mutateDelete } = useDelete();

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
    // id: record?.report_options,
    id: "report_options:6fm9bs048ug9swq2us7o",
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
        value: addSeparator(id, "caesars_bookings"),
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
                      get_collection_info_1: {
                        ...report_option?.task_input?.get_collection_info_1,
                        email_type: record?.email_type,
                        end_date: formatDateTimeAsDate(new Date()),
                        start_date: formatDateTimeAsDate(new Date()),
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
                      resource: "caesars_bookings",
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
                      message: `successfully run.`,
                      description: "Success with no errors",
                      type: "success",
                    };
                  },
                  errorNotification: (data, values) => {
                    return {
                      message: `Something went wrong when running`,
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
    enableRowActions: true,
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
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item
          onClick={() => {
            setActionType("add_to");
            open();
          }}
          icon={<IconCirclePlus style={{ width: rem(14), height: rem(14) }} />}
        >
          Add To
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            setActionType("chat");
            open();
          }}
          icon={
            <IconMessageCircle style={{ width: rem(14), height: rem(14) }} />
          }
        >
          Chat
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            mutateDelete({
              resource: "execute",
              id: row.original.id,
            });
          }}
          icon={<IconTrash style={{ width: rem(14), height: rem(14) }} />}
        >
          Delete
        </Menu.Item>
      </>
    ),
    renderTopToolbar: ({ table }) => {
      const handleDeactivate = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("deactivating " + row.getValue("name"));
        });
      };

      const handleDelete = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          // console.log("deleting " + row.getValue("id"));
          mutateDelete({
            resource: "execute",
            id: row.original.id,
          });
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
                get_collection_info_1: {
                  ...report_option?.task_input?.get_collection_info_1,
                  email_type: record?.email_type,
                  end_date: formatDateTimeAsDate(new Date()),
                  start_date: formatDateTimeAsDate(new Date()),
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
                resource: "caesars_bookings",
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
                message: `successfully run.`,
                description: "Success with no errors",
                type: "success",
              };
            },
            errorNotification: (data, values) => {
              return {
                message: `Something went wrong when running`,
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

  // dymamic link
  let baseURL = "https://snowstormtechnologyukltd.freshdesk.com/a/tickets/";
  let ticketNumber = record?.schedule_change_freshdesk_ticket_number;
  let freshdesk_shedule_change_url = baseURL + ticketNumber;

  return (
    <>
      {/* <div> row selection: {JSON.stringify(table.getIsSomeRowsSelected)}</div> */}
      {/* <div>{JSON.stringify(dataTask)}</div> */}
      <Show isLoading={isLoading}>
        <div>
          <Text>
            <b>Id:</b> {record?.id}
          </Text>
          <Text>
            <b>Package Id:</b> {record?.package_id}
          </Text>
          <Text>
            <b>Flight PNR:</b> {record?.pnr}
          </Text>
          <Text>
            <b>Lead Passenger Name:</b> {record?.lead_passenger_name}
          </Text>
          <Text>
            <b>Lead Passenger Email:</b> {record?.lead_passenger_email}
          </Text>
          <Text>
            <b>Freshdesk Schedule Change Ticket:</b>{" "}
            <Anchor href={freshdesk_shedule_change_url} target="_blank">
              {ticketNumber}
            </Anchor>
          </Text>
          <Text>
            <b>Schedule Change Remarks:</b> {record?.schedule_change_remarks}
          </Text>
          <p>
            <b>Old PNR text:</b>
            <pre>{record?.old_pnr_text}</pre>
          </p>
          <p>
            <b>New PNR Text:</b>
            <pre>{record?.new_pnr_text}</pre>
          </p>
        </div>
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
