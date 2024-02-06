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
import {
  IconCirclePlus,
  IconEdit,
  IconMessageCircle,
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
  Tooltip,
  Flex,
  Anchor,
  rem,
  Drawer,
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
import { useDisclosure } from "@mantine/hooks";
import { useAppStore } from "src/store";
import AddTo from "./AddTo";
import Chat from "./Chat";

// Define the data structure
interface ITask {
  id: string;
  name: string;
  published: boolean;
  created_at: Date;
  updated_at: Date;
  description: string;
  status: string;
  tags: string[];
}

// Define the data structure
// interface IDocument {
//   id: string;
//   name: string;
//   docs_link: string;
//   status: string;
//   description: string;
// }

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

  const columns = useMemo<MRT_ColumnDef<ITask>[]>(
    () => [
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
                    resource: "test_cases", // resource name or identifier
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
      {
        accessorKey: "tags",
        header: "tags",
      },
    ],
    []
  );

  // additions
  // const {
  //   data: documents_data,
  //   isLoading: isLoadingDocumentsData,
  //   isError: isErrorDocumentsData,
  // } = useList<IDocument, HttpError>({
  //   resource: "documents",
  // });

  // const documents = documents_data?.data ?? [];
  const {
    data,
    isLoading: isLoadingTasks,
    isError: isErrorTasks,
  } = useList<ITask, HttpError>();

  const data_items = data?.data ?? [];
  // useMantineReactTable hook
  const table = useMantineReactTable({
    columns,
    data: data_items,
    // enableRowSelection: true,
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
          id: "depart_at",
          desc: false,
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
      placeholder: "Search Documents",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    state: { isLoading: mutationIsLoading },
    renderDetailPanel: ({ row }) => (
      <div>
        <Text>{row.original.description}</Text>
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
        </Flex>
      );
    },
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
      </>
    ),
  });

  const handleComingSoon = () => {
    alert("Coming Soon");
  };
  return (
    <div className="font-sans text-gray-700 bg-white p-4">
      {/* <div className="mb-4">
        <p className="text-lg font-semibold mb-2">Notice</p>
        <p className="text-sm">
          Stormy is in the process of being built: Expect bugs. Help improve
          Stormy by reporting them and suggesting new features.
        </p>
      </div>
      <div className="mb-4">
        <p className="text-lg font-semibold mb-2">Documentation</p>
        <p className="text-sm">
          Here is a non-extensive list of documents on how to use Stormy. Click
          on the name for more details.
        </p>
      </div> */}
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
