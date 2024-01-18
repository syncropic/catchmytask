import React, { useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
  useGo,
  useCustomMutation,
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
interface IOnewurldBooking {
  id: string;
  sstg_booking_number: string;
  passenger: string;
  sstg_status: string;
  supplier_status: string;
  booking_type: string;
  finance_comments: string;
  supplier_comments: string;
}

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  const { mutate, isLoading, isError } = useCustomMutation();

  // Define the object with the specified keys and values
  const initializePlanRequestData = {
    task: {
      author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      description: "",
      name: "",
      status: "",
    },
    source: {
      location: "database",
      id: "task:⟨208e713a-158c-4153-b09e-5808c486a6f2⟩",
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
      update_record: true,
      record_task_field_name: "generate_schedule_change_email_task",
    },
  };

  const executeRequestData = {
    task: {
      id: "",
    },
    options: {
      rerun_execution_orders: [],
      execution_orders_range: [2, 7],
      execute_by: "execution_orders_range",
      user_feedback: "continue",
    },
    task_input: {
      get_collection_info_01: {
        collection: "schedule_changes",
        filename: "schedule_changes",
        start_date: "2024-01-11",
        end_date: "2024-01-11",
        date_types: ["analysis_date"],
      },
    },
  };

  const columns = useMemo<MRT_ColumnDef<IOnewurldBooking>[]>(
    () => [
      {
        id: "actions",
        accessorKey: "id",
        header: "quick actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <EditButton size="xs" recordItemId={row.original.id} />
          </Group>
        ),
      },
      {
        accessorKey: "sstg_booking_number",
        header: "sstg_booking_number",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "caesars_bookings", // resource name or identifier
                    action: "show",
                    id: row.original.id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.sstg_booking_number}
            </Text>
          </Anchor>
        ),
      },
      { accessorKey: "passenger", header: "passenger" },
      { accessorKey: "booking_type", header: "booking_type" },
      { accessorKey: "sstg_status", header: "sstg_status" },
      { accessorKey: "supplier_status", header: "supplier_status" },
    ],
    []
  );

  const {
    data,
    isLoading: isLoadingOnewurldBooking,
    isError: isErrorOnewurldBooking,
  } = useList<IOnewurldBooking, HttpError>();

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
                ...initializePlanRequestData,
                task: {
                  ...initializePlanRequestData.task,
                  description: "generate_schedule_change_email",
                  // id: addSeparator(row.original.id, "task"),
                  name: row.original.id,
                  status: "active",
                },
                destination: {
                  ...initializePlanRequestData.destination,
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
          {isLoading ? "Loading..." : "Initialize Schedule Change Action Steps"}
        </Menu.Item>
        <Menu.Item>
          {isLoading ? "Loading..." : "Execute Schedule Change Action Steps"}
        </Menu.Item>
      </>
    ),
    renderDetailPanel: ({ row }) => (
      <div>
        <Text>
          <b>Finance Comments:</b> {row.original.finance_comments}
        </Text>
        <Text>
          <b>Supplier Comments:</b> {row.original.supplier_comments}
        </Text>
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
              Download
            </Button>
          </Flex>
        </Flex>
      );
    },
  });
  return (
    <div className="w-max-screen">
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
