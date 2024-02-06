import React, { useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
  useGo,
  useCustomMutation,
  useList,
  HttpError,
  useDelete,
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
  Button,
  Flex,
  Anchor,
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

// Define the data structure
interface IReport {
  id: string;
  name: string;
  in: string;
  out: string;
  kind: string;
  execution_order: number;
  created_at: Date;
  updated_at: Date;
  status: string;
  mail_list: string;
  custom_message: string;
  description: string;
}

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  const { mutate: deleteMutate } = useDelete();

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
        header: "quick actions",
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
                    // ...executeRequestData,
                    task: {
                      id: row.original.in,
                    },
                    options: {
                      // ...executeRequestData.options,
                      execution_orders_range: [
                        row.original.execution_order,
                        row.original.execution_order,
                      ],
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
              {/* {isLoadingCustomMutation ? "Loading..." : "Run"} */}
              {false ? "Loading..." : "Run"}
            </Button>
          </Group>
        ),
      },
      { accessorKey: "in", header: "task" },

      // { accessorKey: "out", header: "function" },
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
                    resource: "execute", // resource name or identifier
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
      { accessorKey: "kind", header: "kind" },
      { accessorKey: "status", header: "status" },
      { accessorKey: "execution_order", header: "execution_order" },

      // {
      //   accessorKey: "published",
      //   header: "Published",
      //   cellProps: (row) => ({ children: row.published ? "Yes" : "No" }),
      // },
      // {
      //   accessorKey: "created_at",
      //   header: "created_at",
      //   Cell: ({ renderedCellValue, row }) => (
      //     <div>{row.original.created_at}</div>
      //   ),
      // },
      // {
      //   accessorKey: "updated_at",
      //   header: "updated_at",
      //   Cell: ({ renderedCellValue, row }) => (
      //     <div>{row.original.created_at}</div>
      //   ),
      // },
    ],
    []
  );

  const {
    data,
    isLoading: isLoadingReports,
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
          onClick={() =>
            mutate({
              url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
              method: "post",
              values: {
                ...refreshReportRequestData,
                task: {
                  ...refreshReportRequestData.task,
                  name: row.original.id,
                },
                destination: {
                  ...refreshReportRequestData.destination,
                  record: addSeparator(row.original.id, "caesars_bookings"),
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
          {mutationIsLoading ? "Loading..." : "Refresh Report"}
        </Menu.Item>
      </>
    ),
    renderDetailPanel: ({ row }) => (
      <div>
        <Text>
          <b>Mail List :</b> {row.original.mail_list}
        </Text>
        <Text>
          <b>Custom Message :</b> {row.original.custom_message}
        </Text>
        <Text>
          <b>Description :</b> {row.original.description}
        </Text>
      </div>
    ),
    renderTopToolbar: ({ table }) => {
      const handleDelete = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          console.log("deleting " + row.original.id);
          deleteMutate({
            resource: "execute",
            id: row.original.id,
          });
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
              onClick={handleDelete}
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
              Download
            </Button>
          </Flex>
        </Flex>
      );
    },
  });
  return (
    <div className="w-max-screen">
      <CreateButton></CreateButton>
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
