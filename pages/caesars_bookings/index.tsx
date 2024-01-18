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
interface ICaesarsBooking {
  id: string;
  package_id: string;
  pnr: string;
  schedule_change_agent_name: string;
  schedule_change_hkd: string;
  schedule_change_type: string;
  depart_at: Date;
  updated_at: Date;
  old_pnr_text: string;
  new_pnr_text: string;
  schedule_change_remarks: string;
  lead_passenger_name: string;
  generate_schedule_change_email_task: string;
  schedule_change_freshdesk_ticket_number: string;
}

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  // Define the object with the specified keys and values
  const createScheduleChangeEmailRequestData = {
    task: {
      author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      description: "generate_schedule_change_email",
      status: "active",
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
      rerun_execution_orders: [],
      execution_orders_range: [1, 7],
      execute_by: "execution_orders_range",
      user_feedback: "continue",
    },
    task_input: {
      get_collection_info_01: {
        collection: "schedule_changes",
        filename: "schedule_changes",
        start_date: "2024-01-17",
        end_date: "2024-01-17",
        date_types: ["analysis_date"],
      },
    },
  };

  const columns = useMemo<MRT_ColumnDef<ICaesarsBooking>[]>(
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
        accessorKey: "package_id",
        header: "package_id",
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
              {row.original.package_id}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorKey: "pnr",
        header: "pnr",
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
              {row.original.pnr}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorFn: (row) => new Date(row.depart_at), //convert to Date for sorting and filtering
        header: "depart_at",
        filterVariant: "date",
        filterFn: "equals",
        sortingFn: "datetime",
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(), //render Date as a string
      },

      { accessorKey: "schedule_change_agent_name", header: "agent" },
      {
        accessorKey: "schedule_change_freshdesk_ticket_number",
        header: "freshdesk_ticket",
        Cell: ({ row }) => {
          // dymamic link
          let baseURL =
            "https://snowstormtechnologyukltd.freshdesk.com/a/tickets/";
          let ticketNumber =
            row.original.schedule_change_freshdesk_ticket_number;
          let url = baseURL + ticketNumber;
          return (
            <Anchor href={url}>
              {row.original.schedule_change_freshdesk_ticket_number}
            </Anchor>
          );
        },
      },
      { accessorKey: "schedule_change_type", header: "type" },
      { accessorKey: "schedule_change_hkd", header: "hkd" },
      {
        accessorFn: (row) => new Date(row.updated_at), //convert to Date for sorting and filtering
        header: "updated_at",
        filterVariant: "date",
        filterFn: "equals",
        sortingFn: "datetime",
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString(), //render Date as a string
      },
    ],
    []
  );

  const { data, isLoading, isError } = useList<ICaesarsBooking, HttpError>();

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
    state: { isLoading: mutationIsLoading },
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item
          onClick={() =>
            mutate({
              url: `http://localhost/create`,
              method: "post",
              values: {
                ...createScheduleChangeEmailRequestData,
                task: {
                  ...createScheduleChangeEmailRequestData.task,
                  name: row.original.pnr,
                },
                destination: {
                  ...createScheduleChangeEmailRequestData.destination,
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
          {mutationIsLoading ? "Loading..." : "Generate Schedule Change Email"}
        </Menu.Item>
      </>
    ),
    renderDetailPanel: ({ row }) => (
      <div>
        <Text>
          <b>Lead Passenger Name:</b> {row.original.lead_passenger_name}
        </Text>
        <Text>
          <b>Schedule Change Remarks:</b> {row.original.schedule_change_remarks}
        </Text>
        <p>
          <b>Old PNR text:</b>
          <pre>{row.original.old_pnr_text}</pre>
        </p>
        <p>
          <b>New PNR Text:</b>
          <pre>{row.original.new_pnr_text}</pre>
        </p>
      </div>
    ),
    renderTopToolbar: ({ table }) => {
      const handleDelete = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          console.log("deleting " + row.getValue("pnr"));
        });
      };

      const handleGenerateScheduleChangeEmail = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          console.log(
            "generating schedule change email " + row.getValue("pnr")
          );
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
              onClick={handleGenerateScheduleChangeEmail}
              variant="filled"
            >
              Gegerate Schedule Change Email
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
