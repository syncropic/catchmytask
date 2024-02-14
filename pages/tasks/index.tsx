import React, { useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
  useGo,
  useCustomMutation,
  useList,
  HttpError,
  useGetIdentity,
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
  Drawer,
  rem,
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
import AddTo from "./AddTo";
import Chat from "./Chat";
import { useDisclosure } from "@mantine/hooks";
import { useAppStore } from "src/store";
import { parseISO, format } from "date-fns";
import SelectTaskComponent from "@components/selecttask";
import { CompleteActionComponentProps } from "@components/interfaces";
import { IIdentity } from "@components/interfaces";

// Define the data structure
interface IReport {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  executing_record: string;
  action_option: string;
  // start_date: string;
  // end_date: string;
  // date_type: string;
  // description: string;
  // tags: string;
  // mail_list: string;
  // custom_message: string;
  author: string;
}

export const PageList: React.FC<IResourceComponentsProps> = () => {
  // ACTION OPTIONS
  const {
    data: actionOptionsData,
    isLoading: isLoadingActionOptionsData,
    isError: isErrorActionOptionsData,
  } = useList({
    resource: "action_options",
  });

  const action_options = actionOptionsData?.data
    ? actionOptionsData?.data.map((option) => ({
        ...option,
        value: option.display_name,
        label: option.display_name,
        metadata: option.metadata,
      }))
    : [];
  // IDENTITY
  const { data: identity } = useGetIdentity<IIdentity>();
  const go = useGo();
  const [opened, { open, close }] = useDisclosure(false);
  const {
    actionType,
    setActionType,
    activeActionOption,
    setActiveActionOption,
  } = useAppStore();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  const columns = useMemo<MRT_ColumnDef<IReport>[]>(
    () => [
      {
        id: "actions",
        accessorKey: "id",
        enableColumnFilter: false,
        header: "quick actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <Button
              size="xs"
              variant="outline"
              // color={row.original.status === "complete" ? "green" : "blue"}
              onClick={() =>
                handleRun(
                  // executing_record && "request_object" in executing_record
                  //   ? executing_record.request_object
                  //   : null,
                  row.original,
                  row.original,
                  null
                )
              }
            >
              Run
            </Button>

            {/* <Button onClick={handleComingSoon} size="xs" variant="outline">
              Configure
            </Button> */}
          </Group>
        ),
      },
      {
        accessorKey: "id",
        header: "id",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "task", // resource name or identifier
                    action: "show",
                    id: row.original.id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.id}
            </Text>
          </Anchor>
        ),
      },
      { accessorKey: "executing_record", header: "executing_record" },
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
                    resource: "task", // resource name or identifier
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
      //   accessorKey: "description",
      //   header: "tags",
      //   Cell: ({ row }) => <Text size="sm">{row.original.tags}</Text>,
      // },
      {
        accessorFn: (row) => {
          if (row.updated_at === null || row.updated_at === undefined) {
            // Return null or a similar placeholder if updated_at is not available
            return null;
          }
          const sDay = new Date(row.updated_at);
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "updated_at",
        sortingFn: "datetime",
        Cell: ({ row }) => {
          // Check if updated_at is null or undefined before attempting to format
          if (
            row.original?.updated_at === null ||
            row.original?.updated_at === undefined
          ) {
            return <Text size="sm">N/A</Text>; // Display "N/A" or any placeholder text
          }
          return (
            <Text size="sm">
              {format(parseISO(row.original.updated_at), "yyyy-MM-dd hh:mm a")}
            </Text>
          );
        },
      },
      // {
      //   accessorFn: (row) => {
      //     const sDay = new Date(row.start_date);
      //     sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
      //     return sDay;
      //   },
      //   header: "start_date",
      //   sortingFn: "datetime",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {format(parseISO(row.original.start_date), "yyyy-MM-dd hh:mm a")}
      //     </Text>
      //   ),
      // },
      // {
      //   accessorFn: (row) => {
      //     const sDay = new Date(row.end_date);
      //     sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
      //     return sDay;
      //   },
      //   header: "end_date",
      //   sortingFn: "datetime",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {format(parseISO(row.original.end_date), "yyyy-MM-dd hh:mm a")}
      //     </Text>
      //   ),
      // },
      // { accessorKey: "date_type", header: "date_type" },
      { accessorKey: "author", header: "author" },
      // { accessorKey: "tags", header: "tags" },
      {
        accessorKey: "created_at",
        header: "created_at",
        Cell: ({ row }) => {
          // Check if created_at is null or undefined before attempting to format
          if (
            row.original?.created_at === null ||
            row.original?.created_at === undefined
          ) {
            return <Text size="sm">N/A</Text>; // Display "N/A" or any placeholder text
          }
          // Safely format the date since we now know it's not null or undefined
          return (
            <Text size="sm">
              {format(parseISO(row.original.created_at), "yyyy-MM-dd hh:mm a")}
            </Text>
          );
        },
      },
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
    renderRowActions: ({ row }) => (
      <>
        <SelectTaskComponent
          action_options={action_options}
          identity={identity}
          action_step={null}
          data_items={[]}
          record={row.original}
          setActionType={setActionType}
          variant="inline"
          activeActionOption={activeActionOption}
          setActiveActionOption={setActiveActionOption}
        />
      </>
    ),
    renderDetailPanel: ({ row }) => (
      <div>
        {/* <Text>
          <b>Mail List :</b> {row.original.mail_list}
        </Text>
        <Text>
          <b>Custom Message :</b> {row.original.custom_message}
        </Text>
        <Text>
          <b>Description :</b> {row.original.description}
        </Text> */}
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

  const handleRun = (task: any, action_step: any, record: any) => {
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
      method: "post",
      values: {
        ...task,
        // options: {
        //   ...task?.options,
        //   create_database_record: false,
        //   execution_orders_range: [
        //     action_step?.execution_order,
        //     action_step?.execution_order,
        //   ],
        // },
        // task: {
        //   ...task?.task,
        //   id: action_step?.in,
        // },
      },
      successNotification: (data, values) => {
        // invalidate({
        //   resource: "execute",
        //   invalidates: ["list"],
        // });
        return {
          message: `successfully run.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when running`,
          description: "Error",
          type: "error",
        };
      },
    });
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
