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
} from "mantine-react-table";
import { addSeparator } from "src/utils";

// Define the data structure
interface IReport {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  start_date: string;
  end_date: string;
  description: string;
  tags: string;
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

  const columns = useMemo<MRT_ColumnDef<IReport>[]>(
    () => [
      {
        id: "actions",
        accessorKey: "id",
        header: "quick actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <EditButton size="xs" recordItemId={row.original.id} />
            <Button size="xs">Download</Button>
          </Group>
        ),
      },
      {
        accessorKey: "name",
        header: "name",
        Cell: ({ row }) => (
          <Text
            size="sm"
            color="gray"
            onClick={() => {
              go({
                to: {
                  resource: "reports", // resource name or identifier
                  action: "show",
                  id: row.original.id,
                },
                type: "push",
              });
            }}
          >
            {row.original.name}
          </Text>
        ),
      },
      { accessorKey: "created_at", header: "created_at" },
      { accessorKey: "updated_at", header: "updated_at" },
      { accessorKey: "start_date", header: "start_date" },
      { accessorKey: "end_date", header: "end_date" },
      { accessorKey: "tags", header: "tags" },
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
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item>
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
          <b>Description :</b> {row.original.description}
        </Text>
      </div>
    ),
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
