import React, { useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
  useGo,
  useCustomMutation,
  useList,
  HttpError,
  useOne,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconCirclePlus,
  IconEdit,
  IconList,
  IconMessageCircle,
  IconRefresh,
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
  Drawer,
  rem,
  HoverCard,
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
import { addSeparator, formatDateTimeAsDate } from "src/utils";
import AddTo from "./AddTo";
import Chat from "./Chat";
import { useDisclosure } from "@mantine/hooks";
import { useAppStore } from "src/store";
import { parseISO, format } from "date-fns";
import CodeBlock from "src/components/codeblock/codeblock";

// Define the data structure
interface IReport {
  id: string;
  name: string;
  // created_at: string;
  // base_url: string;
  // updated_at: string;
  // flight_flights: {
  //   arrive_airport_code: string;
  //   depart_airport_code: string;
  // };
  // continue_until: [string];
  // environment_type: [string];
  // selection_type: [string];
  // start_date: string;
  // end_date: string;
  // date_type: string;
  // test_result_url: string;
  // caesars_rewards_number: string;
  // flight_class: string;
  // stops: string;
  // author: string;
  // // hotel is an object
  // hotel_filters: {
  //   name: string;
  //   room_type: string;
  // };
  // test: {
  //   result_url: string;
  //   status: string;
  //   items_passed: string;
  //   items_failed: string;
  //   items_total: string;
  //   last_run_at: [string];
  // };
  // // payment_information is an object with any keys
  // payment_information: {
  //   [key: string]: any;
  // };
  // // travellers is an array of objects
  // travelers: {
  //   name: string;
  //   age: number;
  // }[];
}

interface ITask {
  [key: string]: any;
}

function getTravelers(data: any) {
  let totalAdults = 0;
  let totalChildren = 0;
  let totalRooms = 0;

  if (data) {
    data.forEach((traveler: any) => {
      totalAdults += traveler.adults;
      totalChildren += traveler.children;
      totalRooms += traveler.room_number;
    });
  }

  return `${totalAdults} adults, ${totalChildren} children, ${totalRooms} rooms`;
}

function TargetComponent({ data = {} }: { data: any }) {
  if (data?.name) {
    return (
      <HoverCard.Target>
        <Button leftIcon={<IconList></IconList>} size="xs" variant="outline">
          {data?.name}
        </Button>
      </HoverCard.Target>
    );
  }
  if (data?.card_holder_name) {
    return (
      <HoverCard.Target>
        <Button leftIcon={<IconList></IconList>} size="xs" variant="outline">
          {data?.card_holder_name}
        </Button>
      </HoverCard.Target>
    );
  }
  if (data.length > 0) {
    return (
      <HoverCard.Target>
        <Button leftIcon={<IconList></IconList>} size="xs" variant="outline">
          {getTravelers(data)}
        </Button>
      </HoverCard.Target>
    );
  }
  return <div></div>;
}

function Reveal(data: any) {
  return (
    <Group>
      <HoverCard>
        <TargetComponent data={data}></TargetComponent>
        <HoverCard.Dropdown>
          <CodeBlock jsonData={data}></CodeBlock>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
}

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

  const {
    data: testTask,
    isLoading: isLoadingTestTask,
    isError: isErrorTestTask,
  } = useOne<ITask, HttpError>({
    resource: "",
    id: "test_options:i6xu38dceq1yehwvvtud",
  });
  // console.log("testTask", testTask);

  const columns = useMemo<MRT_ColumnDef<IReport>[]>(
    () => [
      {
        id: "actions",
        accessorKey: "id",
        enableColumnFilter: false,
        header: "quick actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <EditButton size="xs" recordItemId={row.original.id} />
            {/* <Button
              onClick={() =>
                mutate({
                  url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
                  method: "post",
                  values: {
                    ...testTask?.data,
                    destination: {
                      ...testTask?.data?.destination,
                      record: addSeparator(row.original.id, "tests"),
                    },
                    task_input: {
                      ...testTask?.data?.task_input,
                      get_collection_info_1: {
                        ...testTask?.data?.task_input?.get_collection_info_1,
                        end_date: formatDateTimeAsDate(new Date()),
                        start_date: formatDateTimeAsDate(new Date()),
                      },
                    },
                  },
                  successNotification: (data, values) => {
                    // invalidate({
                    //   resource: "caesars_bookings",
                    //   invalidates: ["list"],
                    // });
                    return {
                      message: `successfully created.`,
                      description: "Success with no errors",
                      type: "success",
                    };
                  },
                  errorNotification: (data, values) => {
                    return {
                      message: `Something went wrong when creating`,
                      description: "Error",
                      type: "error",
                    };
                  },
                })
              }
              variant="outline"
              size="xs"
            >
              Run
            </Button>
            <Button onClick={handleComingSoon} variant="outline" size="xs">
              Configure
            </Button> */}
          </Group>
        ),
      },

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
                    resource: "callbacks",
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
      // {
      //   accessorKey: "name",
      //   header: "name",
      //   Cell: ({ row }) => (
      //     <Anchor component={Text}>
      //       <Text
      //         size="sm"
      //         onClick={() => {
      //           go({
      //             to: {
      //               resource: "tests", // resource name or identifier
      //               action: "show",
      //               id: row.original.id,
      //             },
      //             type: "push",
      //           });
      //         }}
      //       >
      //         {row.original.name}
      //       </Text>
      //     </Anchor>
      //   ),
      // },
      // {
      //   accessorKey: "base_url",
      //   header: "base_url",
      //   Cell: ({ row }) => (
      //     <Anchor component={Text}>
      //       <Text
      //         size="sm"
      //         onClick={() => {
      //           go({
      //             to: {
      //               resource: "tests", // resource name or identifier
      //               action: "show",
      //               id: row.original.id,
      //             },
      //             type: "push",
      //           });
      //         }}
      //       >
      //         {row.original.base_url}
      //       </Text>
      //     </Anchor>
      //   ),
      // },
      // {
      //   accessorKey: "latest_result",
      //   header: "latest_result",
      //   Cell: ({ row }) => (
      //     // <Anchor component={Text}>
      //     //   <Text
      //     //     size="sm"
      //     //     onClick={() => {
      //     //       go({
      //     //         to: {
      //     //           resource: "tests", // resource name or identifier
      //     //           action: "show",
      //     //           id: row.original.id,
      //     //         },
      //     //         type: "push",
      //     //       });
      //     //     }}
      //     //   >
      //     //     view results
      //     //   </Text>
      //     // </Anchor>
      //     <Anchor href={row.original.test?.result_url} target="_blank">
      //       view results
      //     </Anchor>
      //   ),
      // },
      // {
      //   accessorKey: "test.status",
      //   header: "latest_result",
      //   Cell: ({ row }) => <div>{row.original.test?.status}</div>,
      // },
      // {
      //   accessorFn: (row) => {
      //     const sDay = new Date(row.test?.last_run_at[0]);
      //     sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
      //     return sDay;
      //   },
      //   header: "last_run_at",
      //   sortingFn: "datetime",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {format(
      //         parseISO(row.original.test?.last_run_at[0]),
      //         "yyyy-MM-dd hh:mm a"
      //       )}
      //     </Text>
      //   ),
      // },
      // {
      //   accessorKey: "environment_type",
      //   header: "environment_type",
      //   Cell: ({ row }) => <div>{row.original.environment_type[0]}</div>,
      // },
      // {
      //   accessorKey: "continue_until",
      //   header: "continue_until",
      //   Cell: ({ row }) => <div>{row.original.continue_until[0]}</div>,
      // },
      // {
      //   accessorKey: "selection_type",
      //   header: "selection_type",
      //   Cell: ({ row }) => <div>{row.original.selection_type[0]}</div>,
      // },

      // { accessorKey: "depart_airport_code", header: "depart" },
      // { accessorKey: "arrive_airport_code", header: "arrive" },
      // {
      //   accessorFn: (row) => {
      //     const sDay = new Date(row.start_date[0]);
      //     sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
      //     return sDay;
      //   },
      //   header: "start_date",
      //   sortingFn: "datetime",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {format(parseISO(row.original.start_date[0]), "yyyy-MM-dd hh:mm a")}
      //     </Text>
      //   ),
      // },
      // {
      //   accessorFn: (row) => {
      //     const sDay = new Date(row.end_date[0]);
      //     sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
      //     return sDay;
      //   },
      //   header: "end_date",
      //   sortingFn: "datetime",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {format(parseISO(row.original.end_date[0]), "yyyy-MM-dd hh:mm a")}
      //     </Text>
      //   ),
      // },
      // { accessorKey: "date_type", header: "date_type" },
      // {
      //   accessorKey: "travelers",
      //   header: "travelers",
      //   Cell: ({ row }) => (
      //     <Text size="sm">{Reveal(row.original.travelers)}</Text>
      //   ),
      // },
      // {
      //   accessorKey: "payment_information",
      //   header: "payment_information",
      //   Cell: ({ row }) => (
      //     <Text size="sm">{Reveal(row.original.payment_information)}</Text>
      //   ),
      // },
      // {
      //   accessorKey: "updated_at",
      //   header: "updated_at",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {format(parseISO(row.original.updated_at), "yyyy-MM-dd hh:mm a")}
      //     </Text>
      //   ),
      // },
      // { accessorKey: "author", header: "author" },
      // { accessorKey: "tags", header: "tags" },
      // {
      //   accessorKey: "created_at",
      //   header: "created_at",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {format(parseISO(row.original.created_at), "yyyy-MM-dd hh:mm a")}
      //     </Text>
      //   ),
      // },
    ],
    []
  );

  const {
    data,
    isLoading,
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
          id: "updated_at",
          desc: true,
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
      placeholder: "Search Reports",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    state: { isLoading: mutationIsLoading },
    renderRowActionMenuItems: ({ row }) => (
      <>
        <Menu.Item
          onClick={() => {
            setActionType("add_to");
            open();
          }}
          icon={<IconCirclePlus style={{ width: rem(14), height: rem(14) }} />}
        >
          {isLoading ? "Loading..." : "Add To"}
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
          {isLoading ? "Loading..." : "Chat"}
        </Menu.Item>
      </>
    ),
    renderDetailPanel: ({ row }) => (
      <div>
        <CodeBlock jsonData={row.original}></CodeBlock>
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
            <CreateButton></CreateButton>
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              onClick={handleComingSoon}
              variant="filled"
            >
              Delete
            </Button>
            {/* <Tooltip label="Allowed file types: .xlsx, .json, .xml">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                onClick={handleComingSoon}
                variant="filled"
              >
                Import
              </Button>
            </Tooltip> */}
            <Tooltip label="Export file types: .xlsx, .json">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                onClick={handleComingSoon}
                variant="filled"
              >
                Export
              </Button>
            </Tooltip>
          </Flex>
        </Flex>
      );
    },
  });
  const handleComingSoon = () => {
    alert("Coming Soon");
  };
  return (
    <div className="w-max-screen">
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
