import React, { useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
  useGo,
  useCustomMutation,
  useList,
  HttpError,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconCirclePlus,
  IconEdit,
  IconMessageCircle,
  IconRefresh,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import {
  ScrollArea,
  Table,
  Pagination,
  Group,
  MantineProvider,
  Menu,
  Box,
  ActionIcon,
  Text,
  Button,
  Flex,
  Anchor,
  Tooltip,
  Drawer,
  rem,
} from "@mantine/core";
import {
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
  CreateButton,
} from "@refinedev/mantine";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
} from "mantine-react-table";
import { addSeparator } from "src/utils";
import AddTo from "./AddTo";
import Chat from "./Chat";
import { useDisclosure } from "@mantine/hooks";
import { useAppStore } from "src/store";
import { parseISO, format } from "date-fns";

// Define the data structure
interface IReport {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  executing_record: string;
  action_option: string;
  // start_date: string;
  // end_date: string;
  // date_type: string;
  // description: string;
  // tags: string;
  // mail_list: string;
  // custom_message: string;
  author: string;
}

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  const [opened, { open, close }] = useDisclosure(false);
  const actionType = useAppStore((state) => state.actionType);
  const setActionType = useAppStore((state) => state.setActionType);
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  // Define the object with the specified keys and values
  const refreshReportRequestData = {
    task: {
      author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      description: "generate_schedule_change_email",
      status: "active",
      id: "task:⟨4eab1ed2-13a3-4781-b2ba-3f1694805cc5⟩",
    },
    source: {
      location: "database",
      id: "task:⟨40c4a2ca-c35d-4ea7-bd33-084a6a5212dd⟩",
    },
    destination: {
      location: "database",
      record: "",
      id: "",
    },
    options: {
      sync_from_source_to_destination: true,
      delete_source_from_destination: false,
      plan_with_llm: false,
      rerun_execution_orders: [],
      execution_orders_range: [11, 20],
      execute_by: "execution_orders_range",
      user_feedback: "continue",
    },
    task_input: {
      generate_sql_query_01: {
        text_query:
          "Retrieve all onewurld bookings from cyDashBoardSetupTable where reporting date is >= 2024-01-16 and <= 2024-01-16. The collection is onewurld",
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

  const columns = useMemo<MRT_ColumnDef<IReport>[]>(
    () => [
      {
        id: "actions",
        accessorKey: "id",
        enableColumnFilter: false,
        header: "quick actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <EditButton size="xs" recordItemId={row.original.id} />
            {/* <Button size="xs" onClick={handleComingSoon}>
              Download
            </Button> */}
          </Group>
        ),
      },
      {
        accessorKey: "id",
        header: "id",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "task", // resource name or identifier
                    action: "show",
                    id: row.original.id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.id}
            </Text>
          </Anchor>
        ),
      },
      { accessorKey: "executing_record", header: "executing_record" },
      {
        accessorKey: "name",
        header: "name",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "task", // resource name or identifier
                    action: "show",
                    id: row.original.id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.name}
            </Text>
          </Anchor>
        ),
      },
      { accessorKey: "action_option", header: "action_option" },

      // {
      //   accessorKey: "description",
      //   header: "tags",
      //   Cell: ({ row }) => <Text size="sm">{row.original.tags}</Text>,
      // },
      {
        accessorFn: (row) => {
          const sDay = new Date(row.updated_at);
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "updated_at",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {format(parseISO(row.original.updated_at), "yyyy-MM-dd hh:mm a")}
          </Text>
        ),
      },
      // {
      //   accessorFn: (row) => {
      //     const sDay = new Date(row.start_date);
      //     sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
      //     return sDay;
      //   },
      //   header: "start_date",
      //   sortingFn: "datetime",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {format(parseISO(row.original.start_date), "yyyy-MM-dd hh:mm a")}
      //     </Text>
      //   ),
      // },
      // {
      //   accessorFn: (row) => {
      //     const sDay = new Date(row.end_date);
      //     sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
      //     return sDay;
      //   },
      //   header: "end_date",
      //   sortingFn: "datetime",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {format(parseISO(row.original.end_date), "yyyy-MM-dd hh:mm a")}
      //     </Text>
      //   ),
      // },
      // { accessorKey: "date_type", header: "date_type" },
      { accessorKey: "author", header: "author" },
      // { accessorKey: "tags", header: "tags" },
      {
        accessorKey: "created_at",
        header: "created_at",
        Cell: ({ row }) => (
          <Text size="sm">
            {format(parseISO(row.original.created_at), "yyyy-MM-dd hh:mm a")}
          </Text>
        ),
      },
    ],
    []
  );

  const {
    data,
    isLoading,
    isError: isErrorReports,
  } = useList<IReport, HttpError>();

  const data_items = data?.data ?? [];

  // useMantineReactTable hook
  const table = useMantineReactTable({
    columns,
    data: data_items,
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
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      sorting: [
        {
          id: "updated_at",
          desc: true,
        },
      ],
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "lg",
    },
    mantineSearchTextInputProps: {
      placeholder: "Search Reports",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item
          onClick={() => {
            setActionType("add_to");
            open();
          }}
          icon={<IconCirclePlus style={{ width: rem(14), height: rem(14) }} />}
        >
          {isLoading ? "Loading..." : "Add To"}
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
          {isLoading ? "Loading..." : "Chat"}
        </Menu.Item>
        <Menu.Item
          icon={<IconRefresh style={{ width: rem(14), height: rem(14) }} />}
          onClick={handleComingSoon}
          // onClick={() =>
          //   mutate({
          //     url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
          //     method: "post",
          //     values: {
          //       ...refreshReportRequestData,
          //       task: {
          //         ...refreshReportRequestData.task,
          //         name: row.original.id,
          //       },
          //       destination: {
          //         ...refreshReportRequestData.destination,
          //         record: addSeparator(row.original.id, "caesars_bookings"),
          //       },
          //     },
          //     successNotification: (data, values) => {
          //       return {
          //         message: `${row.original.id} Successfully fetched.`,
          //         description: "Success with no errors",
          //         type: "success",
          //       };
          //     },
          //     errorNotification: (data, values) => {
          //       return {
          //         message: `Something went wrong when getting ${row.original.id}`,
          //         description: "Error",
          //         type: "error",
          //       };
          //     },
          //   })
        >
          {mutationIsLoading ? "Loading..." : "Refresh Report"}
        </Menu.Item>
      </>
    ),
    renderDetailPanel: ({ row }) => (
      <div>
        {/* <Text>
          <b>Mail List :</b> {row.original.mail_list}
        </Text>
        <Text>
          <b>Custom Message :</b> {row.original.custom_message}
        </Text>
        <Text>
          <b>Description :</b> {row.original.description}
        </Text> */}
      </div>
    ),
    renderTopToolbar: ({ table }) => {
      const handleDeactivate = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("deactivating " + row.getValue("name"));
        });
      };

      const handleActivate = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("activating " + row.getValue("name"));
        });
      };

      const handleContact = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          alert("contact " + row.getValue("name"));
        });
      };

      return (
        <Flex p="md" justify="space-between">
          <Flex gap="xs">
            {/* import MRT sub-components */}
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <CreateButton></CreateButton>
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              onClick={handleComingSoon}
              variant="filled"
            >
              Delete
            </Button>
            {/* <Tooltip label="Allowed file types: .xlsx, .json, .xml">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                onClick={handleComingSoon}
                variant="filled"
              >
                Import
              </Button>
            </Tooltip> */}
            <Tooltip label="Export file types: .xlsx, .json">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                onClick={handleComingSoon}
                variant="filled"
              >
                Export
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      );
    },
  });
  const handleComingSoon = () => {
    alert("Coming Soon");
  };
  return (
    <div className="w-max-screen">
      <Drawer
        opened={opened}
        onClose={close}
        title={actionType}
        position="right"
      >
        {actionType === "add_to" && <AddTo />}
        {actionType === "chat" && <Chat />}
      </Drawer>
      <MantineProvider
        theme={{
          colorScheme: "light",
          primaryColor: "blue",
        }}
      >
        <MantineReactTable table={table} />
      </MantineProvider>
    </div>
  );
};
export default PageList;
