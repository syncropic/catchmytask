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
  useGetIdentity,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconEdit,
  IconMail,
  IconSearch,
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
  HoverCard,
  Modal,
  Drawer,
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
import { useAppStore } from "src/store";
import MessageCreate from "../messages/create";
import DownloadCreate from "../downloads/create";
import QueryCreate from "../query/create";
import { IconDownload } from "@tabler/icons";
import { IShortcut } from "./interfaces";
import { IIdentity } from "@components/interfaces";
import { useOne } from "@refinedev/core";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  const { mutate: mutateDelete } = useDelete();
  const { data: identity } = useGetIdentity<IIdentity>();

  const {
    actionType,
    setActionType,
    activeSession,
    setActiveSession,
    opened,
    setOpened,
  } = useAppStore();

  const columns = useMemo<MRT_ColumnDef<IShortcut>[]>(
    () => [
      {
        accessorKey: "name",
        header: "shortcuts",
        // minSize: 100, //min size enforced during resizing
        // maxSize: 50, //max size enforced during resizing
        // size: 50, //medium column
        Cell: ({ row }) => (
          <>
            {/* <Anchor component={Text}>
              <Text
                size="sm"
                onClick={() => {
                  setActionType("set_shortcut");
                  setActiveSession(row.original);
                  go({
                    to: {
                      resource: row.original.record_name,
                      action: "show",
                      id: row.original.record_id,
                    },

                    type: "push",
                  });
                }}
              >
                {row.original.name}
              </Text>
            </Anchor> */}
            <Group>
              <HoverCard
                width={280}
                shadow="md"
                withinPortal={true}
                openDelay={1000}
              >
                <HoverCard.Target>
                  <Anchor component={Text}>
                    <Text
                      size="sm"
                      onClick={() => {
                        setActionType("setActiveSession");
                        // get active session using useOne
                        // setActiveSession(row.original);
                        go({
                          to: {
                            resource: row.original.record_name,
                            action: "show",
                            id: row.original.record_id,
                          },
                          type: "push",
                        });
                      }}
                    >
                      {row.original.name}
                    </Text>
                  </Anchor>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Anchor component={Text}>
                    <Text
                      size="sm"
                      onClick={() => {
                        setActionType("remove_from_shortcuts");
                        mutateDelete(
                          {
                            resource: "shortcuts",
                            id: row.original.id,
                          },
                          {
                            onError: (error, variables, context) => {
                              // An error occurred!
                              console.log("error", error);
                            },
                            onSuccess: (data, variables, context) => {
                              // Let's celebrate!
                              // invalidate({
                              //   resource: "shortcuts",
                              //   invalidates: ["list"],
                              // });
                            },
                          }
                        );
                      }}
                    >
                      (-) Remove from shortcuts
                    </Text>
                  </Anchor>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>
          </>
        ),
      },
    ],
    []
  );

  const {
    data,
    isLoading: isLoadingReports,
    isError: isErrorReports,
  } = useList<IShortcut, HttpError>({
    resource: "shortcuts",
    filters: [
      {
        field: "author",
        operator: "eq",
        value: identity?.email,
      },
    ],
  });

  const data_items = data?.data ?? [];

  const table = useMantineReactTable({
    columns,
    data: data_items,
    enableColumnActions: false,
    enableColumnFilters: false,
    enablePagination: false,
    enableSorting: false,
    enableTopToolbar: false,
    initialState: {
      density: "xs",
    },
    mantineTableContainerProps: { sx: { maxHeight: "350px" } },
    mantineTableProps: {
      highlightOnHover: false,
      withColumnBorders: true,
      // withBorder: colorScheme === 'light',
      sx: {
        "thead > tr": {
          backgroundColor: "inherit",
        },
        "thead > tr > th": {
          backgroundColor: "inherit",
        },
        "tbody > tr > td": {
          backgroundColor: "inherit",
        },
      },
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
