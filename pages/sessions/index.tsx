// import ListView from "@components/ListView";
// import { IDataset } from "@components/interfaces";
// import { HttpError, IResourceComponentsProps, useOne } from "@refinedev/core";
// import React from "react";

// export const PageList: React.FC<IResourceComponentsProps> = () => {
//   // list of all available applications dataset columns
//   // sessions dataset
//   const { data, isLoading, isError, error } = useOne<IDataset, HttpError>({
//     resource: "datasets",
//     id: "datasets:⟨0d2b472d-0473-4770-b7f9-0a1c986b824f⟩",
//   });
//   // console.log("applications_dataset", data);
//   // create show_item that implements the IShowItem interface from the item in list key where name  == "default"

//   // const { subscriptions } = useSubscriptions();
//   if (isLoading) return <div>Loading...</div>;
//   if (isError) return <div>Error: {JSON.stringify(error)}</div>;
//   // const list_item = data?.data?.list?.find((item) => item.name == "default");
//   const list_item = data?.data.list.find((item) => item.name == "sidebar");

//   return (
//     <>
//       <ListView item={list_item} />
//     </>
//   );
// };
// export default PageList;

import {
  HttpError,
  IResourceComponentsProps,
  useCreate,
  useDelete,
  useGetIdentity,
  useGo,
  useInvalidate,
  useList,
} from "@refinedev/core";
import React, { useMemo } from "react";

import {
  Anchor,
  Flex,
  Group,
  HoverCard,
  MantineProvider,
  Text,
} from "@mantine/core";
import { CreateButton } from "@refinedev/mantine";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useAppStore } from "src/store";
// import QueryCreate from "../query/create";
import { IIdentity, ISession } from "@components/interfaces";

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
        header: "session",
        Cell: ({ row }) => (
          <>
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
                        // setActionType("setActiveSession");
                        setActiveSession(row.original);
                        go({
                          to: {
                            resource: "sessions",
                            action: "show",
                            id: row.original.id,
                            meta: {
                              applicationId: row.original.application,
                            },
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

    enableColumnFilters: true,
    enableStickyHeader: true,

    initialState: {
      density: "xs",
      // showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 7, pageIndex: 0 },
    },
    enablePagination: false,
    enableBottomToolbar: false, //hide the bottom toolbar as well if you want
    // paginationDisplayMode: "pages",
    // positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      // radius: "xl",
      size: "xs",
    },
    // mantineSearchTextInputProps: {
    //   placeholder: "Search sessions",
    // },
    mantineTableContainerProps: { sx: { maxHeight: "350px" } },

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
          </Flex>
          <Flex sx={{ gap: "8px" }}></Flex>
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
