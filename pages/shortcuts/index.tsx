import { IIdentity, IShortcut } from "@components/interfaces";
import { Anchor, Group, HoverCard, MantineProvider, Text } from "@mantine/core";
import {
  HttpError,
  IResourceComponentsProps,
  useDelete,
  useGetIdentity,
  useGo,
  useList,
} from "@refinedev/core";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import React, { useMemo } from "react";
import { useAppStore } from "src/store";

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
        header: "My Shortcuts",

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
