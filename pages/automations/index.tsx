import React, { useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
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
} from "@refinedev/mantine";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useGo } from "@refinedev/core";

// Define the data structure
interface IAutomation {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  description: string;
}

// Default configuration
const default_config = {
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
    sorting: [
      {
        id: "created_at", // Column ID to sort by
        desc: true, // false for ascending, true for descending
      },
    ],
  },
  renderRowActionMenuItems: ({ row }: { row: any }) => (
    <>
      <Menu.Item>
        <ShowButton size="xs" recordItemId={row.original.id} />
      </Menu.Item>
      <Menu.Item>
        <EditButton size="xs" recordItemId={row.original.id} />
      </Menu.Item>
      <Menu.Item>
        <DeleteButton size="xs" recordItemId={row.original.id} />
      </Menu.Item>
    </>
  ),
};

// Dynamic configuration (can be updated based on user input or other conditions)
const dynamic_config = {
  // Add any dynamic configuration options here
};

// Combine default and dynamic configurations
const table_config = { ...default_config, ...dynamic_config };

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();

  const columns = useMemo<MRT_ColumnDef<IAutomation>[]>(
    () => [
      {
        id: "actions",
        accessorKey: "id",
        header: "Quick Actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <Button size="xs" variant="outline">
              Run
            </Button>
            <Button size="xs" variant="outline">
              Active/Deactivate
            </Button>
          </Group>
        ),
      },
      {
        accessorKey: "id",
        header: "id",
        Cell: ({ row }) => (
          <Text
            size="sm"
            color="gray"
            onClick={() => {
              go({
                to: {
                  resource: "automations", // resource name or identifier
                  action: "show",
                  id: row.original.id,
                },
                type: "push",
              });
            }}
          >
            {row.original.id}
          </Text>
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
                  resource: "automations", // resource name or identifier
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
    ],
    []
  );

  const { data, isLoading, isError } = useList<IAutomation, HttpError>();

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
