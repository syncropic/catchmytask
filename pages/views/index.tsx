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
import { IView } from "./interfaces";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  const { mutate: deleteMutate } = useDelete();
  const {
    actionType,
    setActionType,
    activeViews,
    setActiveViews,
    opened,
    setOpened,
  } = useAppStore();

  const columns = useMemo<MRT_ColumnDef<IView>[]>(
    () => [
      {
        accessorKey: "name",
        header: "views",
        // minSize: 100, //min size enforced during resizing
        // maxSize: 50, //max size enforced during resizing
        // size: 50, //medium column
        Cell: ({ row }) => (
          <>
            <Anchor component={Text}>
              <Text
                size="sm"
                onClick={() => {
                  setActionType("set_view");
                  setActiveViews(row.original);
                  go({
                    to: {
                      resource: row.original.resource, // resource name or identifier
                      action: "list",
                      // id: row.original.id,
                    },
                    query: {
                      view: row.original.id,
                      // filters: [
                      //   {
                      //     field: "title",
                      //     operator: "contains",
                      //     value: "Refine",
                      //   },
                      // ],
                    },
                    type: "push",
                  });
                }}
              >
                {row.original.name}
              </Text>
            </Anchor>
            {/* <Group>
            <HoverCard width={280} shadow="md" withinPortal={true}>
              <HoverCard.Target>
                <Anchor component={Text}>
                  <Text
                    size="sm"
                    onClick={() => {
                      setActionType("set_view");
                      setActiveViews(row.original);
                      go({
                        to: {
                          resource: row.original.resource, // resource name or identifier
                          action: "list",
                          // id: row.original.id,
                        },
                        query: {
                          view: row.original.id,
                          // filters: [
                          //   {
                          //     field: "title",
                          //     operator: "contains",
                          //     value: "Refine",
                          //   },
                          // ],
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
                <Text size="sm">{row.original.name}</Text>
                <Anchor>
                  <Text
                    size="sm"
                    onClick={() => {
                      // setActionType("set_view");
                      // setActiveViews(row.original);
                      go({
                        to: {
                          resource: "views", // resource name or identifier
                          action: "show",
                          id: row.original.id,
                        },
                        query: {
                          view: row.original.id,
                          // filters: [
                          //   {
                          //     field: "title",
                          //     operator: "contains",
                          //     value: "Refine",
                          //   },
                          // ],
                        },
                        type: "push",
                      });
                    }}
                  >
                    See view details
                  </Text>
                </Anchor>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group> */}
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
  } = useList<IView, HttpError>({
    resource: "views",
    filters: [
      {
        field: "view_status",
        operator: "eq",
        value: "published",
      },
    ],
  });

  const data_items = data?.data ?? [];

  // useMantineReactTable hook
  const table = useMantineReactTable({
    columns,
    data: data_items,
    enableColumnResizing: true,
    // enableRowSelection: true,
    // enableColumnOrdering: true,
    // enableGlobalFilter: true,
    enableColumnFilters: true,
    // enableRowActions: true,
    enableStickyHeader: true,
    // enableColumnFilterModes: true,
    // enableFacetedValues: true,
    // enableGrouping: true,
    // enablePinning: true,
    initialState: {
      density: "xs",
      // showGlobalFilter: true,
      showColumnFilters: true,
      // pagination: { pageSize: 7, pageIndex: 0 },
      // sorting: [
      //   {
      //     id: "updated_at",
      //     desc: true,
      //   },
      // ],
    },
    // paginationDisplayMode: "pages",
    // positionToolbarAlertBanner: "bottom",
    // mantinePaginationProps: {
    //   radius: "xl",
    //   size: "xs",
    // },
    mantineSearchTextInputProps: {
      placeholder: "Search Views",
    },
    mantineTableContainerProps: { sx: { maxHeight: "350px" } },
    // renderRowActionMenuItems: ({ row }) => (
    //   <>
    //     <Menu.Item
    //       onClick={() =>
    //         mutate({
    //           url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
    //           method: "post",
    //           values: {
    //             ...refreshReportRequestData,
    //             task: {
    //               ...refreshReportRequestData.task,
    //               name: row.original.id,
    //             },
    //             destination: {
    //               ...refreshReportRequestData.destination,
    //               record: addSeparator(row.original.id, "caesars_bookings"),
    //             },
    //           },
    //           successNotification: (data, values) => {
    //             return {
    //               message: `${row.original.id} Successfully fetched.`,
    //               description: "Success with no errors",
    //               type: "success",
    //             };
    //           },
    //           errorNotification: (data, values) => {
    //             return {
    //               message: `Something went wrong when getting ${row.original.id}`,
    //               description: "Error",
    //               type: "error",
    //             };
    //           },
    //         })
    //       }
    //     >
    //       {mutationIsLoading ? "Loading..." : "Refresh Report"}
    //     </Menu.Item>
    //   </>
    // ),
    // renderDetailPanel: ({ row }) => (
    //   <div>
    //     <Text>
    //       <b>Mail List :</b> {row.original.mail_list}
    //     </Text>
    //     <Text>
    //       <b>Custom Message :</b> {row.original.custom_message}
    //     </Text>
    //     <Text>
    //       <b>Description :</b> {row.original.description}
    //     </Text>
    //   </div>
    // ),
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
            {/* <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} /> */}
            <CreateButton size="xs" resource="views">
              Create View
            </CreateButton>
            <Tooltip label="Send Views">
              <ActionIcon variant="filled" aria-label="Send" size="sm">
                <IconMail
                  // size={20}
                  // style={{ width: "70%", height: "70%" }}
                  // stroke={1.5}
                  onClick={() => {
                    setActionType("open_send");
                    setOpened(true);
                  }}
                />
              </ActionIcon>
            </Tooltip>
            {/* <Tooltip label="Download Views">
              <ActionIcon variant="filled" aria-label="Dowload" size="sm">
                <IconDownload
                  // size={20}
                  // style={{ width: "70%", height: "70%" }}
                  // stroke={1.5}
                  onClick={() => {
                    setActionType("open_download");
                    setOpened(true);
                  }}
                />
              </ActionIcon>
            </Tooltip> */}
            <Tooltip label="Query">
              <ActionIcon variant="filled" aria-label="Query" size="sm">
                <IconSearch
                  // size={20}
                  // style={{ width: "70%", height: "70%" }}
                  // stroke={1.5}
                  onClick={() => {
                    setActionType("open_query");
                    setOpened(true);
                  }}
                />
              </ActionIcon>
            </Tooltip>
            {/* <Button
              size="xs"
              leftIcon={<IconMail size={18} />}
             
            ></Button> */}
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            {/* <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleDelete}
              variant="filled"
            >
              Delete
            </Button> */}
            {/* <Button
              color="green"
              disabled={!table.getIsSomeRowsSelected()}
              onClick={handleActivate}
              variant="filled"
            >
              Download
            </Button> */}
          </Flex>
        </Flex>
      );
    },
  });
  return (
    <div className="w-max-screen">
      <Modal
        opened={opened && actionType !== "open_query"}
        onClose={() => setOpened(false)}
        title={actionType === "open_send" ? "Send Message" : "Download"}
        size="xl"
      >
        {actionType === "open_send" && <MessageCreate />}
        {actionType === "open_download" && <DownloadCreate />}
      </Modal>
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={actionType === "open_query" ? "Query" : "Query"}
        // size="xl"
        position="right"
      >
        {actionType === "open_query" && <QueryCreate />}
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
