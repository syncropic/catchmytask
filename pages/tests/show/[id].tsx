import {
  IResourceComponentsProps,
  useShow,
  useOne,
  useCustomMutation,
  useDelete,
  useInvalidate,
  useGetIdentity,
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
import {
  addSeparator,
  formatDateTimeAsDate,
  formatDateTimeAsDateTime,
} from "src/utils";
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

type IIdentity = {
  [key: string]: any;
};

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

  const { data: identity } = useGetIdentity<IIdentity>();

  const { id } = useParsed();
  const { queryResult } = useShow();
  const { data, isLoading } = queryResult;

  const record = data?.data;

  // report_options data
  const {
    data: testOptionData,
    isLoading: isLoadingReportOptionData,
    isError: isErrorReportOptionData,
  } = useOne<IReportOption, HttpError>({
    resource: "test_options",
    // id: record?.report_options,
    id: "test_options:i6xu38dceq1yehwvvtud",
  });

  const test_option = testOptionData?.data ?? [];
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
        value: addSeparator(id, "tests"),
      },
    ],
  });

  const handleRun = (task: any, action_step: any, record: any) => {
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
      method: "post",
      values: {
        ...task,
        task_input: {
          ...task?.task_input,
          get_collection_info_1: {
            ...task?.task_input?.get_collection_info_1,
            // email_type: record?.email_type,
            end_date: formatDateTimeAsDateTime(new Date()),
            start_date: formatDateTimeAsDateTime(new Date()),
          },
        },
        options: {
          ...task?.options,
          execution_orders_range: [
            action_step?.execution_order,
            action_step?.execution_order,
          ],
        },
        task: {
          ...task?.task,
          id: action_step?.in,
        },
        values: {
          action_step_id: addSeparator(action_step?.id, "execute"),
          task_id: action_step?.in,
          resource: "tests",
          author: identity?.email,
          source_record_id: addSeparator(record?.id, "tests"),
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
  };

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
              onClick={() => handleRun(test_option, row.original, record)}
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
      const handleBulkRun = () => {
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
          handleRun(test_option, row.original, record);
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
              onClick={handleBulkRun}
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
            <b>Name:</b> {record?.name}
          </Text>
          <Text>
            <b>Items Passed:</b> {record?.test?.items_passed}
          </Text>
          <Text>
            <b>Items Failed:</b> {record?.test?.items_failed}
          </Text>
          <Text>
            <b>Items Total:</b> {record?.test?.items_total}
          </Text>
          <Text>
            <b>Latest Result:</b>{" "}
            <Anchor href={record?.test?.result_url} target="_blank">
              view results
            </Anchor>
          </Text>
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
