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
  useCreate,
  useGetIdentity,
  useInvalidate,
} from "@refinedev/core";

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
// import QueryCreate from "../query/create";
import { IconDownload } from "@tabler/icons";
import { ISession } from "./interfaces";
import { IIdentity } from "@components/interfaces";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  const { mutate: deleteMutate } = useDelete();
  const { mutate: mutateCreate } = useCreate();
  const { data: identity } = useGetIdentity<IIdentity>();
  const invalidate = useInvalidate();
  const {
    actionType,
    setActionType,
    activeSession,
    setActiveSession,
    opened,
    setOpened,
  } = useAppStore();

  const columns = useMemo<MRT_ColumnDef<ISession>[]>(
    () => [
      {
        accessorKey: "name",
        header: "sessions",
        // minSize: 100, //min size enforced during resizing
        // maxSize: 50, //max size enforced during resizing
        // size: 50, //medium column
        Cell: ({ row }) => (
          <>
            {/* <Anchor component={Text}>
              <Text
                size="sm"
                onClick={() => {
                  setActionType("setActiveSession");
                  setActiveSession(row.original);
                  go({
                    to: {
                      resource: "sessions",
                      action: "show",
                      id: row.original.id,
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
                        setActiveSession(row.original);
                        go({
                          to: {
                            resource: "sessions",
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
                </HoverCard.Target>
                <HoverCard.Dropdown>
                  <Anchor component={Text}>
                    <Text
                      size="sm"
                      onClick={() => {
                        setActionType("add_to_shortcuts");
                        mutateCreate(
                          {
                            resource: "shortcuts",
                            values: {
                              name: row.original.name,
                              author: identity?.email,
                              record_name: "sessions",
                              record_id: row.original.id,
                            },
                          },
                          {
                            onError: (error, variables, context) => {
                              // An error occurred!
                              console.log("error", error);
                            },
                            onSuccess: (data, variables, context) => {
                              // Let's celebrate!
                              // i don't need to the useCreate hook already does that
                              // invalidate({
                              //   resource: "shortcuts",
                              //   invalidates: ["list"],
                              // });
                            },
                          }
                        );
                      }}
                    >
                      (+) Add to shortcuts
                    </Text>
                  </Anchor>
                </HoverCard.Dropdown>
              </HoverCard>
            </Group>
          </>
        ),
      },
      {
        accessorKey: "author",
        header: "author",
      },
    ],
    [identity]
  );

  const {
    data,
    isLoading: isLoadingReports,
    isError: isErrorReports,
  } = useList<ISession, HttpError>({
    resource: "sessions",
    filters: [
      {
        field: "session_status",
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
      placeholder: "Search sessions",
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
            <CreateButton size="xs" resource="sessions">
              Create Session
            </CreateButton>
            {/* <Tooltip label="Send sessions">
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
            </Tooltip> */}
            {/* <Tooltip label="Download sessions">
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
            {/* <Tooltip label="Query">
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
            </Tooltip> */}
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
      {/* <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title={actionType === "open_query" ? "Query" : "Query"}
        // size="xl"
        position="right"
      >
        {actionType === "open_query" && <QueryCreate />}
      </Drawer> */}
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
