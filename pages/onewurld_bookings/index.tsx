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
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
} from "mantine-react-table";
import {
  addSeparator,
  evaluateCondition,
  formatDateTimeAsDate,
  formatDateTimeAsDateTime,
  getCellStyleInline,
  handleComingSoon,
  updateTableVisibility,
} from "src/utils";
import { useDisclosure } from "@mantine/hooks";
import AddTo from "./AddTo";
import Chat from "./Chat";
import { useAppStore } from "src/store";
import {
  IOnewurldBooking,
  IView,
  IIdentity,
  ColumnConfig,
  Column,
} from "./interfaces";

import ReactMantineTableView from "@components/ReactMantineTableView";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const invalidate = useInvalidate();

  const { activeActionOption, setActiveActionOption } = useAppStore();
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

  const go = useGo();
  // const { mutate, isLoading, isError } = useCustomMutation();
  const [opened, { open, close }] = useDisclosure(false);

  const {
    actionType,
    setActionType,
    activeViews,
    setActiveViews,
    opened: global_opened,
    setOpened,
    activeViewStats,
    setActiveViewStats,
  } = useAppStore();

  // custom mutation
  const {
    mutate: customMutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  // interface TableInstance {
  //   getAllLeafColumns: () => Column[];
  //   resetColumnPinning: () => void;
  //   setColumnVisibility: (visibility: Record<string, boolean>) => void;
  //   setColumnPinning: (pinning: Record<"left" | "right", string[]>) => void;
  // }

  const data_columns = useMemo<MRT_ColumnDef<IOnewurldBooking>[]>(
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
        accessorKey: "sst_booking_type",
        header: "sst_booking_type",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.sst_booking_type ?? ""}</div>,
      },
      {
        accessorKey: "sst_status",
        header: "sst_status",
        filterVariant: "multi-select",
        Cell: ({ row }) => {
          let comparison_column = "";
          if (activeViews?.name === "supplier_issues_onewurld_bookings") {
            comparison_column = "sst_status_and_supplier_status_comparison";
          }
          if (activeViews?.name === "finance_issues_onewurld_bookings") {
            comparison_column = "sst_status_and_payment_status_comparison";
          }
          const style = getCellStyleInline(
            row.original.sst_status_and_supplier_status_comparison ?? "",
            activeViews,
            comparison_column
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
        // aggregationFn: "count", //calc total points for each team by adding up all the points for each player on the team
        Footer: ({ table }) => {
          let filteredRows = table.getFilteredRowModel().rows;
          let total = filteredRows.length;
          // where cell value is match
          let match = filteredRows.filter(
            (row) =>
              row.original.sst_status_and_supplier_status_comparison === "match"
          ).length;
          // where cell value is mismatch
          let mismatch = filteredRows.filter(
            (row) =>
              row.original.sst_status_and_supplier_status_comparison ===
              "mismatch"
          ).length;
          // where cell is check_manually
          let check_manually = filteredRows.filter(
            (row) =>
              row.original.sst_status_and_supplier_status_comparison ===
              "check_manually"
          ).length;
          return (
            <div>
              Total: {total}. Match: {match}. Mismatch: {mismatch}. Check
              Manually: {check_manually}
            </div>
          );
        },
      },
      {
        accessorKey: "payment_status",
        header: "payment_status",
        Cell: ({ row }) => {
          let comparison_column = "";
          if (activeViews?.name === "finance_issues_onewurld_bookings") {
            comparison_column = "sst_status_and_payment_status_comparison";
          }
          const style = getCellStyleInline(
            row.original.sst_status_and_payment_status_comparison ?? "",
            activeViews,
            comparison_column
          );
          return <div style={style}>{row.original.payment_status ?? ""}</div>;
        },
      },
      {
        accessorKey: "sst_status_and_payment_status_comparison",
        header: "sst_status_and_payment_status_comparison",
        Cell: ({ row }) => (
          <div>
            {row.original.sst_status_and_payment_status_comparison ?? ""}
          </div>
        ),
      },
      {
        accessorKey: "sst_supplier_cost_usd",
        header: "sst_supplier_cost_usd",
        Cell: ({ row }) => {
          let comparison_column = "";
          if (activeViews?.name === "supplier_issues_onewurld_bookings") {
            comparison_column = "supplier_cost_comparison";
          }
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
          let comparison_column = "";
          if (activeViews?.name === "supplier_issues_onewurld_bookings") {
            comparison_column = "supplier_cost_comparison";
          }
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
        Footer: ({ table }) => {
          let filteredRows = table.getFilteredRowModel().rows;
          let total = filteredRows.length;
          // where cell value is match
          let match = filteredRows.filter(
            (row) => row.original.supplier_cost_comparison === "match"
          ).length;
          // // where cell value is mismatch
          let low_negative_difference = filteredRows.filter(
            (row) =>
              row.original.supplier_cost_comparison ===
              "low_negative_difference"
          ).length;
          let medium_negative_difference = filteredRows.filter(
            (row) =>
              row.original.supplier_cost_comparison ===
              "medium_negative_difference"
          ).length;
          // // where cell value is mismatch
          let high_negative_difference = filteredRows.filter(
            (row) =>
              row.original.supplier_cost_comparison ===
              "high_negative_difference"
          ).length;

          return (
            <div>
              Total: {total}. Match: {match}. Low (-) Diff:{" "}
              {low_negative_difference}. Medium (-) Diff:{" "}
              {low_negative_difference}. High (-) Diff:{" "}
              {high_negative_difference}
            </div>
          );
        },
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
        accessorKey: "sst_final_selling_price_usd",
        header: "sst_final_selling_price_usd",
        Cell: ({ row }) => {
          let comparison_column = "";
          if (activeViews?.name === "finance_issues_onewurld_bookings") {
            comparison_column = "paid_vs_selling_amount_usd_comparison";
          }
          const style = getCellStyleInline(
            row.original.paid_vs_selling_amount_usd_comparison ?? "",
            activeViews,
            "paid_vs_selling_amount_usd_comparison"
          );
          return (
            <div style={style}>
              {row.original.sst_final_selling_price_usd ?? ""}
            </div>
          );
        },
      },
      {
        accessorKey: "payment_amount_captured_usd_total",
        header: "payment_amount_captured_usd_total",
        Cell: ({ row }) => {
          let comparison_column = "";
          if (activeViews?.name === "finance_issues_onewurld_bookings") {
            comparison_column = "paid_vs_selling_amount_usd_comparison";
          }
          const style = getCellStyleInline(
            row.original.paid_vs_selling_amount_usd_comparison ?? "",
            activeViews,
            comparison_column
          );
          return (
            <div style={style}>
              {row.original.payment_amount_captured_usd_total ?? ""}
            </div>
          );
        },
      },
      {
        accessorKey: "paid_vs_selling_amount_usd_difference",
        header: "paid_vs_selling_amount_usd_difference",
        Cell: ({ row }) => (
          <div>{row.original.paid_vs_selling_amount_usd_difference ?? ""}</div>
        ),
      },
      {
        accessorKey: "paid_vs_selling_amount_usd_comparison",
        header: "paid_vs_selling_amount_usd_comparison",
        Cell: ({ row }) => (
          <div>{row.original.paid_vs_selling_amount_usd_comparison ?? ""}</div>
        ),
      },
      {
        accessorKey: "payment_succeeded_count",
        header: "payment_succeeded_count",
        Cell: ({ row }) => (
          <div>{row.original.payment_succeeded_count ?? ""}</div>
        ),
      },
      {
        accessorKey: "original_payment_currencies",
        header: "original_payment_currencies",
        Cell: ({ row }) => (
          <div>{row.original.original_payment_currencies ?? ""}</div>
        ),
      },
      {
        accessorKey: "payment_amount_to_usd_rate",
        header: "payment_amount_to_usd_rate",
        Cell: ({ row }) => (
          <div>{row.original.payment_amount_to_usd_rate ?? ""}</div>
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
    ],
    [activeViews]
  );

  const {
    data,
    isLoading: isLoadingDataItems,
    isError: isErrorLoadingDataItems,
  } = useList<IOnewurldBooking, HttpError>();

  const data_items = data?.data ?? [];

  const [filteredDataItems, setFilteredDataItems] = useState(data_items);

  return (
    <>
      <ReactMantineTableView
        data_columns={data_columns}
        resource="onewurld_bookings"
        data_items={data_items}
        isLoadingDataItems={isLoadingDataItems}
        updateTableVisibility={updateTableVisibility}
        initialStateColumnPinningLeft={["sst_booking_number"]}
      ></ReactMantineTableView>
    </>
  );
};
export default PageList;
