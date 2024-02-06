import React, { useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
  useGo,
  useCustomMutation,
  HttpError,
  useList,
  useInvalidate,
  useGetIdentity,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconCirclePlus,
  IconEdit,
  IconMail,
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
  Flex,
  Anchor,
  rem,
  Drawer,
  Tooltip,
  Popover,
  Select,
  MultiSelect,
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
import { addSeparator, formatDateTimeAsDateTime } from "src/utils";
import { useDisclosure } from "@mantine/hooks";
import { useAppStore } from "src/store";
import AddTo from "./AddTo";
import Chat from "./Chat";
import { useOne } from "@refinedev/core";
import { DatePickerInput } from "@mantine/dates";

// Define the data structure
interface ICaesarsBooking {
  id: string;
  package_id: string;
  pnr: string;
  schedule_change_agent_name: string;
  schedule_change_hkd: string;
  schedule_change_type: string;
  depart_at: Date;
  updated_at: Date;
  old_pnr_text: string;
  new_pnr_text: string;
  schedule_change_remarks: string;
  lead_passenger_name: string;
  generate_schedule_change_email_task: string;
  schedule_change_freshdesk_ticket_number: string;
}

interface ITask {
  [key: string]: any;
}

type IIdentity = {
  [key: string]: any;
};

const handleComingSoon = () => {
  alert("Coming Soon");
};

export const PageList: React.FC<IResourceComponentsProps> = () => {
  // TASK_OPTIONS
  // let task_options = [];
  const {
    data: taskOption_1,
    isLoading: isLoadingTask,
    isError: isErrorTask,
  } = useOne<ITask, HttpError>({
    resource: "",
    id: "report_options:6fm9bs048ug9swq2us7o",
  });
  const generate_schedule_change_task_option = taskOption_1?.data;
  // task_options.push(task_option);
  // console.log(task_options);

  // IDENTITY
  const { data: identity } = useGetIdentity<IIdentity>();

  // OTHER
  const go = useGo();
  const [opened, { open, close }] = useDisclosure(false);
  const actionType = useAppStore((state) => state.actionType);
  const setActionType = useAppStore((state) => state.setActionType);

  // INVALIDATE
  const invalidate = useInvalidate();

  // CUSTOM MUTATION FUNCTION
  const {
    mutate: customMutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  // HANDLE EXECUTE
  const handleCreate = (task: any, action_step: any, record: any) => {
    let request_data = {
      ...task,
      task_input: {
        ...task?.task_input,
        get_collection_info_1: {
          ...task?.task_input?.get_collection_info_1,
          end_date: formatDateTimeAsDateTime(new Date()),
          start_date: formatDateTimeAsDateTime(new Date()),
        },
        create_email_message_1: {
          email_type: record?.email_type,
          personal_message: record?.custom_message,
          internal_message: record?.custom_message,
          custom_message: record?.custom_message,
        },
        send_email_message_1: {
          mail_list: record?.mail_list,
        },
      },
      task: {
        ...task?.task,
        id: action_step?.in,
      },
      destination: {
        ...task?.destination,
        record: addSeparator(record?.id, "caesars_bookings"),
      },
    };

    // Conditionally adding execution_orders_range
    if (action_step) {
      request_data.options = {
        ...task?.options,
        execution_orders_range: [
          action_step.execution_order,
          action_step.execution_order,
        ],
      };
      request_data.values = {
        action_step_id: addSeparator(action_step?.id, "execute"),
        task_id: action_step?.in,
        resource: "caesars_bookings",
        author: identity?.email,
        record: addSeparator(record?.id, "caesars_bookings"),
      };
      request_data.task = {
        ...task?.task,
        id: action_step?.in, // this is already known if running an action_step on an existing task
      };
    } else {
      request_data.options = {
        ...task?.options,
      };
      request_data.values = {
        // action_step_id: addSeparator(action_step?.id, "execute"),
        // task_id: action_step?.in,
        resource: "caesars_bookings",
        author: identity?.email,
        record: addSeparator(record?.id, "caesars_bookings"),
      };
      request_data.task = {
        ...task?.task,
        // id: will fill in when task is generated
      };
    }
    console.log(request_data);
    customMutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
      method: "post",
      values: request_data,
      successNotification: (data, values) => {
        invalidate({
          resource: "caesars_bookings",
          invalidates: ["list"],
        });
        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when executing`,
          description: "Error",
          type: "error",
        };
      },
    });
  };
  // ACTION LIST
  const actionsList = [
    {
      text: "Generate Schedule Change Email",
      action_type: "generate_schedule_change_email",
      icon: <IconMail size={14} />,
      use_open: false,
      task_option: generate_schedule_change_task_option,
      onClick: handleCreate,
    },
    {
      text: "Chat",
      action_type: "chat",
      use_open: true,
      task_option: null,
      icon: <IconMessageCircle size={14} />,
      onClick: () => {
        console.log("Starting Chat");
      },
    },
    {
      text: "Add To",
      action_type: "add_to",
      use_open: true,
      task_option: null,
      icon: <IconCirclePlus size={14} />,
      onClick: () => {
        console.log("Adding to...");
      },
    },
  ];

  // LIST
  // LIST DATA
  const { data, isLoading, isError } = useList<ICaesarsBooking, HttpError>();
  const data_items = data?.data ?? [];

  // LIST TABLE COLUMNS
  const columns = useMemo<MRT_ColumnDef<ICaesarsBooking>[]>(
    () => [
      {
        id: "actions",
        accessorKey: "id",
        header: "quick actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <EditButton size="xs" recordItemId={row.original.id} />
          </Group>
        ),
      },
      {
        accessorKey: "package_id",
        header: "package_id",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "caesars_bookings",
                    action: "show",
                    id: row.original.id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.package_id}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorKey: "pnr",
        header: "pnr",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "caesars_bookings",
                    action: "show",
                    id: row.original.id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.pnr}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorKey: "schedule_change_freshdesk_ticket_number",
        header: "freshdesk_ticket",
        Cell: ({ row }) => {
          // dymamic link
          let baseURL =
            "https://snowstormtechnologyukltd.freshdesk.com/a/tickets/";
          let ticketNumber =
            row.original.schedule_change_freshdesk_ticket_number;
          let url = baseURL + ticketNumber;
          return (
            <Anchor href={url} target="_blank">
              {row.original.schedule_change_freshdesk_ticket_number}
            </Anchor>
          );
        },
      },
      {
        accessorKey: "updated_at",
        header: "updated_at",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original.updated_at)}
          </Text>
        ),
      },
      {
        accessorKey: "depart_at",
        header: "depart_at",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original.depart_at)}
          </Text>
        ),
      },

      { accessorKey: "schedule_change_agent_name", header: "agent" },

      { accessorKey: "schedule_change_type", header: "type" },
      { accessorKey: "schedule_change_hkd", header: "hkd" },
    ],
    []
  );

  // LIST TABLE INSTANCE
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
      placeholder: "Search Bookings",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    state: { isLoading: mutationIsLoading },
    renderRowActions: ({ row }) => (
      <>
        <SelectTaskComponent
          actionsList={actionsList}
          setActionType={setActionType}
          open={open}
          action_step={null}
          record={row.original}
        />
      </>
    ),
    renderDetailPanel: ({ row }) => (
      <div>
        <Text>
          <b>Lead Passenger Name:</b> {row.original.lead_passenger_name}
        </Text>
        <Text>
          <b>Schedule Change Remarks:</b> {row.original.schedule_change_remarks}
        </Text>
        <p>
          <b>Old PNR text:</b>
          <pre>{row.original.old_pnr_text}</pre>
        </p>
        <p>
          <b>New PNR Text:</b>
          <pre>{row.original.new_pnr_text}</pre>
        </p>
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
            <Button
              color="green"
              disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleGenerateScheduleChangeEmail}
              onClick={handleComingSoon}
              variant="filled"
            >
              Gegerate Schedule Change Emails
            </Button>
            <Tooltip label="Allowed file types: .xlsx, .json, .xml">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                onClick={handleComingSoon}
                variant="filled"
              >
                Import
              </Button>
            </Tooltip>
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

function SelectTaskComponent({
  setActionType,
  actionsList,
  open,
  action_step,
  record,
}: {
  setActionType: any;
  actionsList: any;
  open: any;
  action_step: any;
  record: any;
}) {
  return (
    <Popover width={300} position="bottom" withArrow shadow="xl">
      <Popover.Target>
        <Button size="xs">Action</Button>
      </Popover.Target>
      <Popover.Dropdown>
        <div className="flex items-end space-x-2">
          <MultiSelect
            className="flex-1"
            label="actions"
            searchable={true}
            data={actionsList.map((action: any) => action.text)}
            withinPortal={true}
          />
          <Button size="xs">Run</Button>
        </div>
        <div className="mt-4">
          <div className="grid grid-cols-1 gap-2">
            {actionsList.map((action: any, index: any) => (
              <Button
                key={index}
                className="justify-start"
                size="xs"
                variant="outline"
                leftIcon={action.icon}
                onClick={() => {
                  // set action type
                  setActionType(action.action_type);
                  // open window to configure that action
                  if (action.use_open) {
                    open();
                  }
                  // execute the action function. (move this to the configure action window later for items that are configurable)
                  action.onClick(action.task_option, action_step, record);
                }}
              >
                {action.text}
              </Button>
            ))}
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
