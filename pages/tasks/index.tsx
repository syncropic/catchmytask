import React, { useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
  useGo,
  HttpError,
  useList,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import { IconEdit, IconSend, IconTrash } from "@tabler/icons-react";
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
  Flex,
  Button,
  Anchor,
} from "@mantine/core";
import {
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/mantine";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
} from "mantine-react-table";
import { useCustomMutation, useApiUrl } from "@refinedev/core";
import { addSeparator } from "src/utils";
import { useNotification } from "@refinedev/core";

// Define the data structure
interface ITask {
  id: string;
  name: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
  description: string;
  status: string;
}

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  // Define columns
  const { mutate, isLoading, isError } = useCustomMutation();
  const columns = useMemo<MRT_ColumnDef<ITask>[]>(
    () => [
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
      {
        accessorKey: "name",
        header: "Name",
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
      // {
      //   accessorKey: "published",
      //   header: "Published",
      //   cellProps: ({row}) => ({ children: row.published ? "Yes" : "No" }),
      // },
      {
        accessorKey: "created_at",
        header: "Created At",
        Cell: ({ renderedCellValue, row }) => (
          <DateField
            value={row.original.created_at}
            format="YYYY-MM-DD HH:mm:ss"
          />
        ),
        // cellProps: (row) => ({ children: row.updated_at.toLocaleString() }),
      },
      {
        accessorKey: "updated_at",
        header: "Updated At",
        Cell: ({ renderedCellValue, row }) => (
          <DateField
            value={row.original.updated_at}
            format="YYYY-MM-DD HH:mm:ss"
          />
        ),
        // cellProps: (row) => ({ children: row.updated_at.toLocaleString() }),
      },
      {
        id: "actions",
        accessorKey: "id",
        header: "Row Actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <ShowButton hideText recordItemId={row.original.id} />
            <EditButton hideText recordItemId={row.original.id} />
            <DeleteButton hideText recordItemId={row.original.id} />
          </Group>
        ),
      },
    ],
    []
  );

  const {
    data,
    isLoading: isLoadingTasks,
    isError: isErrorTasks,
  } = useList<ITask, HttpError>();

  const data_items = data?.data ?? [];

  // Define the object with the specified keys and values
  const requestData = {
    task: {
      author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      description: "",
      name: "",
      status: "",
    },
    source: {
      location: "database",
      id: "task:⟨40c4a2ca-c35d-4ea7-bd33-084a6a5212dd⟩",
    },
    destination: {
      location: "database",
      id: "",
    },
    options: {
      sync_from_source_to_destination: true,
      delete_source_from_destination: false,
      plan_with_llm: false,
    },
  };

  const executeRequestData = {
    task: {
      id: "task:⟨4eab1ed2-13a3-4781-b2ba-3f1694805cc5⟩",
    },
    options: {
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
          id: "created_at", // Column ID to sort by
          desc: true, // false for ascending, true for descending
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
      placeholder: "Search Bookings",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item
          onClick={() =>
            mutate({
              url: `http://localhost/initialize-plan`,
              method: "post",
              values: {
                ...requestData,
                task: {
                  ...requestData.task,
                  description: row.original.description,
                  id: addSeparator(row.original.id, "task"),
                  name: row.original.name,
                  status: "active",
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
          {isLoading ? "Loading..." : "Initialize"}
        </Menu.Item>
        <Menu.Item
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
          {isLoading ? "Loading..." : "Execute"}
        </Menu.Item>
      </>
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
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleDeactivate}
              variant="filled"
            >
              Delete
            </Button>
            <Button
              color="green"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleActivate}
              variant="filled"
            >
              Run
            </Button>
          </Flex>
        </Flex>
      );
    },
  });
  return (
    <MantineProvider
      theme={{
        colorScheme: "light",
        primaryColor: "blue",
      }}
    >
      <MantineReactTable table={table} />
    </MantineProvider>
  );
};
export default PageList;
