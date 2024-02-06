import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  IResourceComponentsProps,
  GetManyResponse,
  useMany,
  useGo,
  useCustomMutation,
  HttpError,
  useList,
  useGetIdentity,
  useInvalidate,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconCirclePlus,
  IconEdit,
  IconFilterCheck,
  IconMail,
  IconMessageCircle,
  IconPlus,
  IconSend,
  IconSettings,
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
  Autocomplete,
  MultiSelect,
  TextInput,
  Popover,
  Select,
  Accordion,
  Title,
  Modal,
} from "@mantine/core";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import {
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
  useForm,
  Create,
} from "@refinedev/mantine";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
} from "mantine-react-table";
import {
  addSeparator,
  formatDateTimeAsDate,
  formatDateTimeAsDateTime,
} from "src/utils";
import { useDisclosure } from "@mantine/hooks";
import AddTo from "./AddTo";
import Chat from "./Chat";
import { useAppStore } from "src/store";
import { DateInput, DatePicker } from "@mantine/dates";
// import dayjs from "dayjs";
// import Editor, { useMonaco } from "@monaco-editor/react";
// import EditorJS from "@editorjs/editorjs";
// import Header from "@editorjs/header";
// import List from "@editorjs/list";
import Tables from "./Tables";
import IncludeColumns from "./IncludeColumns";
import FilterColumns from "./FilterColumns";
import DatePickerTool from "./DatePickerTool";
import DateInputTool from "./DateInputTool";
import ColumnOptionsTool from "./ColumnOptionsTool";
import { handleRun } from "src/utils";
import { dateTypeOptions } from "src/utils";
import { format, parseISO } from "date-fns";
import {
  IOnewurldBooking,
  IView,
  IIdentity,
  ColumnConfig,
  Column,
} from "./interfaces";

// function defaultStringValues<T>(obj: T): T {
//   const keys = Object.keys(obj) as Array<keyof T>;
//   keys.forEach((key) => {
//     if (
//       typeof obj[key] === "string" &&
//       (obj[key] === null || obj[key] === undefined)
//     ) {
//       obj[key] = "" as any;
//     }
//   });
//   return obj;
// }

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const invalidate = useInvalidate();

  // IDENTITY
  const { data: identity } = useGetIdentity<IIdentity>();
  // ACTION OPTIONS
  const {
    data: actionOptionsData,
    isLoading: isLoadingActionOptionsData,
    isError: isErrorActionOptionsData,
  } = useList({
    resource: "action_options",
  });

  const action_options = actionOptionsData?.data
    ? actionOptionsData?.data
        .map((option) => ({
          ...option,
          value: option.display_name,
          label: option.display_name,
          metadata: option.metadata,
        }))
        .filter((option) =>
          option?.metadata?.resources?.includes("onewurld_bookings")
        )
    : [];

  // use for column visibility
  const [columnVisibility, setColumnVisibility] = useState({
    firstName: false,
  });

  const go = useGo();
  // const { mutate, isLoading, isError } = useCustomMutation();
  const [opened, { open, close }] = useDisclosure(false);
  const [opened_2, { open: open_2, close: close_2 }] = useDisclosure(false);
  // const actionType = useAppStore((state) => state.actionType);
  // const setActionType = useAppStore((state) => state.setActionType);
  const {
    actionType,
    setActionType,
    activeViews,
    setActiveViews,
    opened: global_opened,
    setOpened,
  } = useAppStore();

  // custom mutation
  const {
    mutate: customMutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  // additions
  const {
    data: views_data,
    isLoading: isLoadingViewsData,
    isError: isErrorViewsData,
  } = useList<IView, HttpError>({
    resource: "views",
  });

  const views = views_data?.data ?? [];

  interface TableInstance {
    getAllLeafColumns: () => Column[];
    resetColumnPinning: () => void;
    setColumnVisibility: (visibility: Record<string, boolean>) => void;
    setColumnPinning: (pinning: Record<"left" | "right", string[]>) => void;
  }

  // Example function where the code snippet might be used
  function updateTableVisibility(
    tableInstance: TableInstance,
    columnsConfig: ColumnConfig[] | null
  ) {
    let visibility: Record<string, boolean> = {};
    let pinning: Record<"left" | "right", string[]> = { left: [], right: [] };

    // Reset logic when columnsConfig is null
    if (columnsConfig === null) {
      visibility = tableInstance
        .getAllLeafColumns()
        .reduce<Record<string, boolean>>((acc, column) => {
          acc[column.id] = true; // Assuming you want all columns visible by default
          return acc;
        }, {});

      // Use the resetColumnPinning function to reset pinning to initial state
      tableInstance.resetColumnPinning();
    } else {
      // Hide all columns initially
      visibility = tableInstance
        .getAllLeafColumns()
        .reduce<Record<string, boolean>>((acc, column) => {
          acc[column.id] = false;
          return acc;
        }, {});

      // Update visibility and construct pinning object based on config
      columnsConfig?.forEach((columnConfig) => {
        const { field_name, visible, pin } = columnConfig;
        visibility[field_name] = !!visible;

        // Only add to pinning if 'pin' key exists and it's set to 'left' or 'right'
        if (pin === "left" || pin === "right") {
          pinning[pin].push(field_name);
        }
      });

      // Update the table instance with the new visibility and pinning state
      tableInstance.setColumnVisibility(visibility);
      tableInstance.setColumnPinning(pinning);
    }
  }

  const views_columns = useMemo<MRT_ColumnDef<IView>[]>(
    () => [
      {
        accessorKey: "name",
        header: "name",
        Cell: ({ row }) => {
          return (
            <Anchor>
              <Text
                color="blue"
                onClick={() => {
                  setActionType("set_view");
                  setActiveViews(row.original);
                }}
              >
                {row.original.name}
              </Text>
            </Anchor>
          );
        },
      },
    ],
    []
  );

  // useMantineReactTable hook
  const views_table = useMantineReactTable({
    columns: views_columns,
    data: views,
    enableRowSelection: true,
    // enableColumnOrdering: true,
    // enableGlobalFilter: true,
    enableColumnFilters: true,
    // enableRowActions: true,
    // enableStickyHeader: true,
    // enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enablePinning: true,
    initialState: {
      density: "xs",
      // showGlobalFilter: true,
      showColumnFilters: true,
      // pagination: { pageSize: 30, pageIndex: 0 },
    },
    // paginationDisplayMode: "pages",
    // positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "lg",
    },
    mantineSearchTextInputProps: {
      placeholder: "Search Views",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    state: { isLoading: mutationIsLoading },
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
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            <Button
              // color="red"
              // disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              onClick={() => {
                // setActionType("open_views");
                open_2();
              }}
              // disabled
              variant="outline"
            >
              Send
            </Button>
            {/* <Tooltip label="Export file types: .xlsx, .json">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                onClick={handleComingSoon}
                variant="filled"
              >
                Export
              </Button>
            </Tooltip> */}
          </Flex>
        </Flex>
      );
    },
  });

  // Define the object with the specified keys and values
  const initializePlanRequestData = {
    task: {
      author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      description: "",
      name: "",
      status: "",
    },
    source: {
      location: "database",
      id: "task:⟨208e713a-158c-4153-b09e-5808c486a6f2⟩",
    },
    destination: {
      location: "database",
      record: "",
      id: "",
    },
    options: {
      sync_from_source_to_destination: true,
      delete_source_from_destination: false,
      plan_with_llm: false,
      update_record: true,
      record_task_field_name: "generate_schedule_change_email_task",
    },
  };

  const executeRequestData = {
    task: {
      id: "",
    },
    options: {
      rerun_execution_orders: [],
      execution_orders_range: [2, 7],
      execute_by: "execution_orders_range",
      user_feedback: "continue",
    },
    task_input: {
      get_collection_info_01: {
        collection: "schedule_changes",
        filename: "schedule_changes",
        start_date: "2024-01-11",
        end_date: "2024-01-11",
        date_types: ["analysis_date"],
      },
    },
  };

  const columns = useMemo<MRT_ColumnDef<IOnewurldBooking>[]>(
    () => [
      {
        accessorKey: "sst_booking_number",
        header: "sst_booking_number",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "onewurld_bookings", // resource name or identifier
                    action: "show",
                    id: row.original.related_record,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.sst_booking_number}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.reporting_date);
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "reporting_date",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.reporting_date)}
          </Text>
        ),
      },
      {
        accessorKey: "sst_passenger_name",
        header: "sst_passenger_name",
        Cell: ({ row }) => <div>{row.original.sst_passenger_name ?? ""}</div>,
      },
      {
        accessorKey: "sst_supplier_name",
        header: "sst_supplier_name",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.sst_supplier_name ?? ""}</div>,
      },
      {
        accessorKey: "sst_status",
        header: "sst_status",
        filterVariant: "multi-select",
        Cell: ({ row }) => {
          const style = getCellStyleInline(
            row.original.sst_status_and_supplier_status_comparison ?? "",
            activeViews,
            "sst_status_and_supplier_status_comparison"
          );
          return <div style={style}>{row.original.sst_status ?? ""}</div>;
        },
      },
      {
        accessorKey: "analysis_supplier_status",
        header: "supplier_status",
        filterVariant: "multi-select",
        Cell: ({ row }) => {
          const style = getCellStyleInline(
            row.original.sst_status_and_supplier_status_comparison ?? "",
            activeViews,
            "sst_status_and_supplier_status_comparison"
          );
          return (
            <div style={style}>
              {row.original.analysis_supplier_status ?? ""}
            </div>
          );
        },
      },
      {
        accessorKey: "sst_status_and_supplier_status_comparison",
        header: "sst_status_and_supplier_status_comparison",
        filterVariant: "multi-select",
        Cell: ({ row }) => (
          <div>
            {row.original.sst_status_and_supplier_status_comparison ?? ""}
          </div>
        ),
      },
      {
        accessorKey: "sst_supplier_cost_usd",
        header: "sst_supplier_cost_usd",
        Cell: ({ row }) => {
          const style = getCellStyleInline(
            row.original.supplier_cost_comparison ?? "",
            activeViews,
            "supplier_cost_comparison"
          );
          return (
            <div style={style}>{row.original.sst_supplier_cost_usd ?? ""}</div>
          );
        },
      },
      {
        accessorKey: "analysis_supplier_cost_usd",
        header: "supplier_cost_usd",
        Cell: ({ row }) => {
          const style = getCellStyleInline(
            row.original.supplier_cost_comparison ?? "",
            activeViews,
            "supplier_cost_comparison"
          );
          return (
            <div style={style}>
              {row.original.analysis_supplier_cost_usd ?? ""}
            </div>
          );
        },
      },
      {
        accessorKey: "supplier_cost_difference",
        header: "supplier_cost_difference",
        Cell: ({ row }) => (
          <div>{row.original.supplier_cost_difference ?? ""}</div>
        ),
      },
      {
        accessorKey: "supplier_cost_comparison",
        header: "supplier_cost_comparison",
        filterVariant: "multi-select",
        Cell: ({ row }) => (
          <div>{row.original.supplier_cost_comparison ?? ""}</div>
        ),
      },
      {
        accessorKey: "analysis_supplier_currency",
        header: "original_supplier_currency",
        filterVariant: "multi-select",
        Cell: ({ row }) => (
          <div>{row.original.analysis_supplier_currency ?? ""}</div>
        ),
      },

      // {
      //   accessorKey: "supplier_currency",
      //   header: "supplier_currency",
      //   Cell: ({ row }) => <div>{row.original.supplier_currency ?? ""}</div>,
      // },
      {
        accessorKey: "sst_booking_type",
        header: "sst_booking_type",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.sst_booking_type ?? ""}</div>,
      },
      {
        accessorKey: "sst_final_selling_price_usd",
        header: "sst_final_selling_price_usd",
        Cell: ({ row }) => (
          <div>{row.original.sst_final_selling_price_usd ?? ""}</div>
        ),
      },
      {
        accessorKey: "sst_payment_form",
        header: "sst_payment_form",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.sst_payment_form ?? ""}</div>,
      },

      {
        accessorKey: "sst_distributor_name",
        header: "sst_distributor_name",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.sst_distributor_name ?? ""}</div>,
      },
      {
        accessorKey: "related_record",
        header: "related_record",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "onewurld_bookings", // resource name or identifier
                    action: "show",
                    id: row.original.related_record,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.related_record}
            </Text>
          </Anchor>
        ),
      },

      // {
      //   accessorKey: "issues",
      //   header: "issues",
      //   Cell: ({ row }) => (
      //     <div>{JSON.stringify(row.original.issues ?? "")}</div>
      //   ),
      // },
      {
        accessorKey: "has_unresolved_supplier_issues",
        header: "has_unresolved_supplier_issues",
        filterVariant: "multi-select",
        // Cell: ({ row }) => (
        //   <div>{row.original.has_unresolved_supplier_issue ?? ""}</div>
        // ),
      },
      {
        accessorKey: "has_unresolved_finance_issues",
        header: "has_unresolved_finance_issues",
        filterVariant: "multi-select",
        // Cell: ({ row }) => (
        //   <div>{row.original.has_unresolved_finance_issue ?? ""}</div>
        // ),
      },
      // {
      //   accessorKey: "sst_sales_date",
      //   header: "sst_sales_date",
      //   Cell: ({ row }) => (
      //     <div>
      //       {row.original.sst_sales_date
      //         ? row.original.sst_sales_date.toString()
      //         : ""}
      //     </div>
      //   ),
      // },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.sst_sales_date);
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "sst_sales_date",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.sst_sales_date)}
          </Text>
        ),
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.sst_payment_date);
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "sst_payment_date",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.sst_payment_date)}
          </Text>
        ),
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.sst_cancel_date);
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "sst_cancel_date",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.sst_cancel_date)}
          </Text>
        ),
      },
      // {
      //   accessorKey: "sst_pay_later_deadline",
      //   header: "sst_pay_later_deadline",
      //   Cell: ({ row }) => (
      //     <div>
      //       {row.original.sst_pay_later_deadline
      //         ? row.original.sst_pay_later_deadline.toString()
      //         : ""}
      //     </div>
      //   ),
      // },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.sst_pay_later_deadline);
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "sst_pay_later_deadline",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.sst_pay_later_deadline)}
          </Text>
        ),
      },
      {
        accessorKey: "sst_distributor_id",
        header: "sst_distributor_id",
        Cell: ({ row }) => <div>{row.original.sst_distributor_id ?? ""}</div>,
      },
      {
        accessorKey: "sst_ccard_margin",
        header: "sst_ccard_margin",
        Cell: ({ row }) => <div>{row.original.sst_ccard_margin ?? ""}</div>,
      },
      {
        accessorKey: "sst_sst_margin",
        header: "sst_sst_margin",
        Cell: ({ row }) => <div>{row.original.sst_sst_margin ?? ""}</div>,
      },
      {
        accessorKey: "sst_distributor_margin",
        header: "sst_distributor_margin",
        Cell: ({ row }) => (
          <div>{row.original.sst_distributor_margin ?? ""}</div>
        ),
      },
      {
        accessorKey: "sst_super_distributor_margin",
        header: "sst_super_distributor_margin",
        Cell: ({ row }) => (
          <div>{row.original.sst_super_distributor_margin ?? ""}</div>
        ),
      },
      {
        accessorKey: "sst_forex_margin",
        header: "sst_forex_margin",
        Cell: ({ row }) => <div>{row.original.sst_forex_margin ?? ""}</div>,
      },
      {
        accessorKey: "sst_agent_markup",
        header: "sst_agent_markup",
        Cell: ({ row }) => <div>{row.original.sst_agent_markup ?? ""}</div>,
      },
      {
        accessorKey: "sst_marketing_fee",
        header: "sst_marketing_fee",
        Cell: ({ row }) => <div>{row.original.sst_marketing_fee ?? ""}</div>,
      },
      {
        accessorKey: "sst_redeemed_voucher_amount_usd",
        header: "sst_redeemed_voucher_amount_usd",
        Cell: ({ row }) => (
          <div>{row.original.sst_redeemed_voucher_amount_usd ?? ""}</div>
        ),
      },
      {
        accessorKey: "sst_prepaid_postpaid",
        header: "sst_prepaid_postpaid",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.sst_prepaid_postpaid ?? ""}</div>,
      },
      {
        accessorKey: "sst_is_test_booking",
        header: "sst_is_test_booking",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.sst_is_test_booking ?? ""}</div>,
      },
      {
        accessorKey: "sst_is_rebooked",
        header: "sst_is_rebooked",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.sst_is_rebooked ?? ""}</div>,
      },
      {
        accessorKey: "sst_is_paylater",
        header: "sst_is_paylater",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.sst_is_paylater ?? ""}</div>,
      },
      {
        accessorKey: "sst_supplier_id",
        header: "sst_supplier_id",
        Cell: ({ row }) => <div>{row.original.sst_supplier_id ?? ""}</div>,
      },
      {
        accessorKey: "sst_transaction_number",
        header: "sst_transaction_number",
        Cell: ({ row }) => (
          <div>{row.original.sst_transaction_number ?? ""}</div>
        ),
      },
      {
        accessorKey: "analysis_supplier_cost_to_usd_rate",
        header: "analysis_supplier_cost_to_usd_rate",
        Cell: ({ row }) => (
          <div>{row.original.analysis_supplier_cost_to_usd_rate ?? ""}</div>
        ),
      },
      {
        accessorKey: "analysis_supplier_created_date",
        header: "analysis_supplier_created_date",
        Cell: ({ row }) => (
          <div>
            {row.original.analysis_supplier_created_date
              ? row.original.analysis_supplier_created_date.toString()
              : ""}
          </div>
        ),
      },
      {
        accessorKey: "analysis_supplier_updated_date",
        header: "analysis_supplier_updated_date",
        Cell: ({ row }) => (
          <div>
            {row.original.analysis_supplier_updated_date
              ? row.original.analysis_supplier_updated_date.toString()
              : ""}
          </div>
        ),
      },
      {
        accessorKey: "analysis_payment_succeeded_count",
        header: "analysis_payment_succeeded_count",
        Cell: ({ row }) => (
          <div>{row.original.analysis_payment_succeeded_count ?? ""}</div>
        ),
      },
      {
        accessorKey: "analysis_payment_amount_captured_usd_sum",
        header: "analysis_payment_amount_captured_usd_sum",
        Cell: ({ row }) => (
          <div>
            {row.original.analysis_payment_amount_captured_usd_sum ?? ""}
          </div>
        ),
      },
      {
        accessorKey: "analysis_payment_status",
        header: "analysis_payment_status",
        Cell: ({ row }) => (
          <div>{row.original.analysis_payment_status ?? ""}</div>
        ),
      },
      {
        accessorKey:
          "analysis_sst_final_selling_price_usd_and_analysis_payment_amount_captured_usd_sum_difference",
        header:
          "analysis_sst_final_selling_price_usd_and_analysis_payment_amount_captured_usd_sum_difference",
        Cell: ({ row }) => (
          <div>
            {row.original
              .analysis_sst_final_selling_price_usd_and_analysis_payment_amount_captured_usd_sum_difference ??
              ""}
          </div>
        ),
      },
      {
        accessorKey:
          "analysis_sst_final_selling_price_usd_and_analysis_payment_amount_captured_usd_sum_comparison",
        header:
          "analysis_sst_final_selling_price_usd_and_analysis_payment_amount_captured_usd_sum_comparison",
        Cell: ({ row }) => (
          <div>
            {row.original
              .analysis_sst_final_selling_price_usd_and_analysis_payment_amount_captured_usd_sum_comparison ??
              ""}
          </div>
        ),
      },
    ],
    [activeViews]
  );

  const {
    data,
    isLoading: isLoadingOnewurldBooking,
    isError: isErrorOnewurldBooking,
  } = useList<IOnewurldBooking, HttpError>();

  const data_items = data?.data ?? [];

  // const data_items = data?.data.map((item) => defaultStringValues(item)) ?? [];

  const [filteredDataItems, setFilteredDataItems] = useState(data_items);

  // useMantineReactTable hook
  const table = useMantineReactTable({
    columns,
    data: filteredDataItems,
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
    enableEditing: true,
    editDisplayMode: "cell",
    state: { isLoading: mutationIsLoading || isLoadingOnewurldBooking },
    mantineEditTextInputProps: ({ cell }) => ({
      //onBlur is more efficient, but could use onChange instead
      onBlur: (event) => {
        // console.log(cell.getValue());
        // console.log(cell, event.target.value);
        handleSaveCell(cell, event.target.value);
        // console.log(cell, event.target.value);
      },
    }),
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      columnPinning: { left: ["sst_booking_number"] },
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
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            <Button
              // color="red"
              // disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              onClick={() => {
                // invalidate({
                //   resource: "views",
                //   invalidates: ["list"],
                // });
                setActionType("open_send");
                setOpened(true);
                // open();
              }}
              // disabled
              variant="outline"
              leftIcon={<IconMail />}
            >
              Send
            </Button>
            <Button
              // color="red"
              // disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              onClick={() => {
                // setActionType("open_views");
                // open();
                setActionType("set_view");
                setActiveViews(null);
              }}
              // disabled
              variant="outline"
            >
              Clear Views
            </Button>
            <Button
              // color="red"
              // disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              onClick={() => {
                setActionType("chat");
                open();
              }}
              // disabled
              variant="outline"
            >
              Chat
            </Button>
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
            {/* <Tooltip label="Export file types: .xlsx, .json">
              <Button
                // color="green"
                // disabled={!table.getIsSomeRowsSelected()}
                // onClick={handleGenerateScheduleChangeEmail}
                onClick={handleComingSoon}
                variant="filled"
              >
                Export
              </Button>
            </Tooltip> */}
          </Flex>
        </Flex>
      );
    },
    renderDetailPanel: ({ row }) => (
      <div>
        {/* <Text>
          <b>Finance Comments:</b> {row.original.finance_comments}
        </Text>
        <Text>
          <b>Supplier Comments:</b> {row.original.supplier_comments}
        </Text> */}
      </div>
    ),
  });
  const handleComingSoon = () => {
    alert("Coming Soon");
  };

  // FILTERING WITH VIEWS
  const applyFilters = (activeView: any, data: any) => {
    let filteredData = [...data];

    activeView?.filters_configuration?.forEach((filter: any) => {
      if (filter.exclude && filter.exclude.length > 0) {
        // Apply exclusion filter
        // console.log("exclude", filter.exclude);
        filteredData = filteredData.filter(
          (item) => !filter.exclude.includes(item[filter.field_name])
        );
      }

      if (filter.include && filter.include.length > 0) {
        // only apply this with the include filter > 0 otherwise it will return no data
        // Apply inclusion filter
        filteredData = filteredData.filter((item) =>
          filter.include.includes(item[filter.field_name])
        );
      }

      // Additional filter logic (e.g., for range_start, range_end) can be added here if necessary
    });
    // console.log("filtered data", filteredData);

    return filteredData;
  };

  // // When activeViews changes, apply filters
  // useEffect(() => {
  //   if (activeViews) {
  //     const filteredData = applyFilters(activeViews, data_items);
  //     // Update your table's data state here with filteredData
  //     console.log(activeViews);
  //     console.log(filteredData);
  //     filtered_data_items = filteredData;
  //   }
  // }, [activeViews, data_items]);

  // When activeViews changes, apply filters
  useEffect(() => {
    // Reset filtered data and column visibility when activeViews is null
    if (activeViews === null) {
      setFilteredDataItems(data_items);
      updateTableVisibility(table, null); // Reset column visibility to default
    } else {
      // Existing logic for when activeViews is not null
      const newFilteredData = activeViews?.filters_configuration
        ? applyFilters(activeViews, data_items)
        : data_items;
      setFilteredDataItems(newFilteredData);
      updateTableVisibility(table, activeViews?.fields_configuration);
    }
  }, [activeViews, data_items, table]);

  const getCellStyle = (value: any, activeViews: any) => {
    // console.log(value);
    // Ensure that activeViews and activeViews.conditional_formatting are defined
    if (!activeViews || !activeViews.conditional_formatting) {
      return "";
    }

    // Find the formatting rule for the column
    const columnRule = activeViews.conditional_formatting.find(
      (r: any) => r.column === "sst_status_and_supplier_status_comparison"
    );
    // console.log(columnRule);

    // If columnRule is found, search for the specific rule based on value
    if (columnRule) {
      const rule = columnRule.rules.find((r: any) => r.value === value);
      return rule ? rule.class : "";
    }

    return "";
  };

  // Updated version to accept column name dynamically
  const getCellStyleInline = (
    value: any,
    activeViews: any,
    columnName: string
  ) => {
    if (!activeViews || !activeViews.conditional_formatting) {
      return {};
    }
    const columnRule = activeViews.conditional_formatting.find(
      (r: any) => r.column === columnName
    );
    if (columnRule) {
      const rule = columnRule.rules.find((r: any) => r.value === value);
      // Assuming you have a mapping from class names to actual styles
      return rule ? mapClassNameToStyle(rule.class) : {};
    }
    return {};
  };

  // Example mapping function (you need to define the actual CSS properties)
  const mapClassNameToStyle = (className: any) => {
    const styles: { [key: string]: { backgroundColor: string } } = {
      "bg-green-500": { backgroundColor: "#10B981" }, // Tailwind Green 500
      "bg-red-500": { backgroundColor: "#EF4444" }, // Tailwind Red 500
      "bg-gray-500": { backgroundColor: "#6B7280" }, // Tailwind Gray 500
      "bg-orange-500": { backgroundColor: "#F59E0B" }, // Tailwind Orange 500
    };
    return styles[className] || {};
  };

  const handleSaveCell = (cell: any, event: any) => {
    let update_values = {
      id: cell.row.original.related_record,
      [cell.column.id]: event,
    };
    // console.log("update_values", update_values);
    let id = cell.row.original.related_record;
    customMutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/onewurld_bookings/${id}`,
      method: "post",
      values: update_values,
      successNotification: (data, values) => {
        // invalidate list
        invalidate({
          resource: "onewurld_bookings",
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

  return (
    <>
      <div>{/* <DynamicTextInput /> */}</div>
      <div className="w-max-screen">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center p-4 gap-4">
          <div className="hidden md:block"></div>{" "}
          {/* Empty div for spacing on medium and large screens */}
          <SelectTaskComponent
            action_options={action_options}
            identity={identity}
            action_step={null}
            // mutate={customMutate}
            record={null}
            open={open}
            setActionType={setActionType}
            // className="col-span-1 md:col-span-3 lg:col-span-1" // This ensures full width on small screens and centers on larger screens
          />
          <div className="hidden md:block"></div>{" "}
          {/* Empty div for spacing on medium and large screens */}
        </div>
        {/* <DynamicInput></DynamicInput> */}
        {/* <div>LIST ACTIONS PANEL</div> */}
        <Modal opened={opened_2} onClose={close_2} title="Send">
          {/* Modal content */}
          <div>Send Form</div>
        </Modal>
        <Drawer
          opened={opened}
          onClose={close}
          title={actionType}
          position="right"
        >
          {actionType === "add_to" && <AddTo />}
          {actionType === "chat" && <Chat />}
          {["open_views", "set_view"].includes(actionType) && (
            <MantineProvider
              theme={{
                colorScheme: "light",
                primaryColor: "blue",
              }}
            >
              <MantineReactTable table={views_table} />
            </MantineProvider>
          )}
          {actionType === "run" && (
            <CompleteActionComponent
              action_options={action_options}
              identity={identity}
              // mutate={customMutate}
              action_step={null}
              record={null}
              open={open}
              setActionType={setActionType}
            />
          )}
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
    </>
  );
};
export default PageList;

// function DynamicTextInput() {
//   const editorRef = useRef(null);
//   const { text, setText } = useAppStore();
//   // CUSTOM MUTATION FUNCTION
//   const {
//     mutate: customMutate,
//     isLoading: mutationIsLoading,
//     isError: mutationIsError,
//   } = useCustomMutation();

//   // Function to save editor data
//   const saveEditorData = async () => {
//     if (editorRef.current) {
//       // console.log("saveEditorData");
//       const savedData = await editorRef.current.save();
//       const request_data = savedData;
//       customMutate({
//         url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
//         method: "post",
//         values: request_data,
//         successNotification: (data, values) => {
//           // invalidate({
//           //   resource: "caesars_bookings",
//           //   invalidates: ["list"],
//           // });
//           return {
//             message: `successfully executed.`,
//             description: "Success with no errors",
//             type: "success",
//           };
//         },
//         errorNotification: (data, values) => {
//           return {
//             message: `Something went wrong when executing`,
//             description: "Error",
//             type: "error",
//           };
//         },
//       });
//       // console.log(savedData);
//       // setText(JSON.stringify(savedData)); // Update state or send data to server
//     }
//   };

//   useEffect(() => {
//     let EditorJS;

//     import("@editorjs/editorjs").then((module) => {
//       EditorJS = module.default;

//       if (!editorRef.current) {
//         editorRef.current = new EditorJS({
//           holder: "editor",
//           tools: {
//             // header: Header,
//             // list: List,
//             // highlightedText: HighlightedText,
//             tables: {
//               class: Tables,
//               // inlineToolbar: true,
//             }, // Add the Tables tool here
//             include_columns: {
//               class: IncludeColumns,
//               // inlineToolbar: true,
//             }, // Add the Columns tool here
//             filter_columns: {
//               class: FilterColumns,
//               // inlineToolbar: true,
//             }, // Add the Columns tool here
//             // datePicker: {
//             //   class: DateInputTool,
//             //   // Optionally, you can specify other configurations for the tool here
//             // },
//             columnOptions: {
//               class: ColumnOptionsTool,
//               // Optionally, you can specify other configurations for the tool here
//             },
//           },
//         });
//       }
//     });

//     return () => {
//       if (editorRef.current) {
//         // Unmount the React component from the DatePicker container
//         const datePickerContainers =
//           document.querySelectorAll(".date-tool-wrapper");
//         datePickerContainers.forEach((container) => {
//           ReactDOM.unmountComponentAtNode(container);
//         });

//         editorRef.current.destroy();
//         editorRef.current = null;
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <div className="flex justify-center">
//         <Button onClick={saveEditorData}>SAVE</Button>
//       </div>
//       <div id="editor" className="editor-container p-4 bg-white rounded"></div>
//     </div>
//   );
// }

// function SelectTaskComponent({
//   setActionType,
//   action_options,
//   identity,
//   open,
//   // action_step,
//   record,
//   mutate,
// }) {

function SelectTaskComponent({
  setActionType,
  action_options,
  identity,
  action_step,
  open,
  record,
}: CompleteActionComponentProps) {
  const invalidate = useInvalidate();

  const setActiveItem = useAppStore((state) => state.setActiveItem);
  const activeItem = useAppStore((state) => state.activeItem);

  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
  } = useForm({
    initialValues: {
      // author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      // description: "",
      action: [] as string[],
      // start_date: "",
      // end_date: "",
      // date_type: [] as string[],
      // custom_message: "",
      // mail_list: [] as string[],
      // to_email_list: ["dp.wanjala@gmail.com"] as string[],
      // cc_email_list: [] as string[],
      // tags: "",
      // from: "david.wanjala@snowstormtech.com",
      // email_type: ["default"] as string[],
    },
  });

  const handleActionChange = (value: string[]) => {
    const item = action_options.find((item) => item.value === value[0]);
    setActiveItem(item);
    // setActionType("create");
    setFieldValue("action", value);
  };

  return (
    <div className="flex items-end space-x-2">
      <MultiSelect
        className="flex-1"
        label="actions"
        searchable={true}
        data={action_options.map((action) => action.display_name)}
        value={getInputProps("action").value}
        onChange={handleActionChange}
        withinPortal={true}
        // style={{ option: { whiteSpace: "normal" } }} // Adjust this line based on your component's API
      />
      <Button
        size="sm"
        onClick={() => {
          setActionType("run");
          open();
          // handleRun({
          //   identity: identity,
          //   resource: "onewurld_bookings",
          //   record: record,
          //   mutate: mutate,
          //   task: activeItem,
          //   invalidateCallback: () => {
          //     invalidate({
          //       resource: "onewurld_bookings",
          //       invalidates: ["list"],
          //     });
          //   },
          // })
        }}
      >
        RUN
      </Button>
      {/* Changed size to 'sm' for a slightly larger button */}
      <Button size="xs" variant="subtle">
        {" "}
        {/* Make the button subtle */}
        <IconPlus size={16} /> {/* Plus icon from Tabler Icons */}
      </Button>
    </div>
  );
}

interface CompleteActionComponentProps {
  setActionType: (type: string) => void;
  action_options: Array<{ value: string; label: string; [key: string]: any }>; // Adjust based on actual structure
  identity: any; // Define more specific type if possible
  open: () => void;
  // mutate: any; // Define more specific type if possible
  record: any; // Define more specific type if possible
  action_step: any; // Define more specific type if possible
}

interface FormValues {
  start_date: string;
  end_date: string;
  date_type: string[];
  // Add other form fields here as needed
}

function CompleteActionComponent({
  setActionType,
  action_options,
  identity,
  action_step,
  open,
  record,
}: CompleteActionComponentProps) {
  const invalidate = useInvalidate();

  const setActiveItem = useAppStore((state) => state.setActiveItem);
  const activeItem = useAppStore((state) => state.activeItem); // this is the selected action configure and send for run already configured
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
  } = useForm({
    initialValues: {
      // author: "user:TYvGonCb3nVDfdvfxfUvSQh0Zv93",
      // description: "",
      // action: [] as string[],
      start_date: "",
      end_date: "",
      date_type: [] as string[],
      email_type: [] as string[],
      custom_message: "",
      mail_list: [] as string[],
      id: "",
      // to_email_list: ["dp.wanjala@gmail.com"] as string[],
      // cc_email_list: [] as string[],
      // tags: "",
      // from: "david.wanjala@snowstormtech.com",
      // email_type: ["default"] as string[],
    },
  });

  const handleActionChange = (value: string[]) => {
    const item = action_options.find((item) => item.value === value[0]);
    setActiveItem(item);
    // setActionType("create");
    setFieldValue("action", value);
  };

  const handleSubmit = (e: any) => {
    // console.log("values", values);
    let start_date: string = values?.start_date;
    let end_date: string = values?.end_date;

    // Function to format date, handling both string and Date types
    const formatDate = (date: string | Date): string => {
      // if (!date) {
      //     return undefined;
      // }
      if (typeof date === "string") {
        // Handle as string
        return format(parseISO(date), "yyyy-MM-dd");
      } else {
        // Handle as Date object
        return format(date, "yyyy-MM-dd");
      }
    };

    // Convert dates to 'yyyy-MM-dd' format
    start_date = formatDate(start_date);
    end_date = formatDate(end_date);

    if (!start_date || !end_date) {
      console.error("Invalid date format");
      return; // or handle error appropriately
    }

    // console.log("start_date", start_date);
    // console.log(activeItem);

    const task = activeItem;
    // const action_step = null;
    const resource = "onewurld_bookings";
    const record = {
      ...values,
      start_date: start_date,
      end_date: end_date,
    };

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
        generate_sql_query_1: {
          text_query: task?.task_input?.generate_sql_query_1?.text_query
            ?.replace("${start_date}", record?.start_date)
            .replace("${end_date}", record?.end_date),
        },
        generate_sql_query_2: {
          text_query: task?.task_input?.generate_sql_query_2?.text_query
            ?.replace("${start_date}", record?.start_date)
            .replace("${end_date}", record?.end_date),
        },
      },
      task: {
        ...task?.task,
        id: action_step?.in,
      },
      destination: {
        ...task?.destination,
        record: addSeparator(record?.id, resource),
      },
    };

    // Conditionally adding execution_orders_range
    if (action_step) {
      request_data.options = {
        ...task?.options,
        execution_orders_range: [
          action_step?.execution_order,
          action_step?.execution_order,
        ],
      };
      request_data.values = {
        action_step_id: addSeparator(action_step?.id, "execute"),
        task_id: action_step?.in,
        resource: resource,
        author: identity?.email,
        record: addSeparator(record?.id, resource),
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
        ...record,
        resource: "action_runs",
        author: identity?.email,
        record: addSeparator(record?.id, resource),
        action_option: addSeparator(task?.id, "action_options"),
      };
      request_data.task = {
        ...task?.task,
        // id: will fill in when task is generated
      };
    }
    // console.log(request_data);

    // setActionType("run");
    // open();
    // handleRun({
    //   identity: identity,
    //   resource: "onewurld_bookings",
    //   record: record,
    //   mutate: mutate,
    //   task: activeItem,
    //   invalidateCallback: () => {
    //     invalidate({
    //       resource: "onewurld_bookings",
    //       invalidates: ["list"],
    //     });
    //   },
    // })
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
      method: "post",
      values: request_data,
      successNotification: (data, values) => {
        // invalidateCallback();
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
  return (
    <Create
      // isLoading={formLoading}
      isLoading={mutationIsLoading}
      saveButtonProps={{
        disabled: saveButtonProps?.disabled,
        onClick: handleSubmit,
        size: "xs",
      }}
      contentProps={{
        style: {
          // backgroundColor: "cornflowerblue",
          padding: "16px",
          height: "420px",
        },
      }}
      title={<Title order={3}>Configure and Execute Action</Title>}
      goBack={false}
    >
      <MultiSelect
        required
        mt="sm"
        label="date_type"
        placeholder="Select date type"
        data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("date_type")}
        // required
      />
      <DateInput
        required
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="start_date"
        placeholder="Start date"
        {...getInputProps("start_date")}
      />
      <DateInput
        required
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="end_date"
        placeholder="End date"
        {...getInputProps("end_date")}
      />
    </Create>
  );
}
