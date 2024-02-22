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

import ReactMantineTableView from "@components/ReactMantineTableView";
import { IIdentity } from "@components/interfaces";
import { IPayment } from "./interfaces";

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
          option?.metadata?.resources?.includes("onewurld_payments")
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

  const data_columns = useMemo<MRT_ColumnDef<IPayment>[]>(
    () => [
      {
        accessorKey: "payment_id",
        header: "payment_id",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "onewurld_payments", // resource name or identifier
                    action: "show",
                    id: row.original.payment_id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.payment_id}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorKey: "payment_internal_id",
        header: "payment_internal_id",
        Cell: ({ row }) => <div>{row.original.payment_internal_id ?? ""}</div>,
      },
      {
        accessorKey: "payment_status",
        header: "payment_status",
        Cell: ({ row }) => <div>{row.original.payment_status ?? ""}</div>,
      },
      {
        accessorKey: "sst_status",
        header: "sst_status",
        Cell: ({ row }) => <div>{row.original.sst_status ?? ""}</div>,
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
        accessorKey: "payment_amount_captured",
        header: "payment_amount_captured",
        Cell: ({ row }) => (
          <div>{row.original.payment_amount_captured ?? ""}</div>
        ),
      },
      {
        accessorKey: "payment_currency",
        header: "payment_currency",
        Cell: ({ row }) => <div>{row.original.payment_currency ?? ""}</div>,
      },
      {
        accessorKey: "payment_amount_to_usd_rate",
        header: "payment_amount_to_usd_rate",
        Cell: ({ row }) => (
          <div>{row.original.payment_amount_to_usd_rate ?? ""}</div>
        ),
      },
      {
        accessorKey: "payment_amount_captured_usd",
        header: "payment_amount_captured_usd",
        Cell: ({ row }) => (
          <div>{row.original.payment_amount_captured_usd ?? ""}</div>
        ),
      },
      {
        accessorKey: "payment_account_id",
        header: "payment_account_id",
        Cell: ({ row }) => <div>{row.original.payment_account_id ?? ""}</div>,
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.payment_created_date);
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "payment_created_date",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.payment_created_date)}
          </Text>
        ),
      },
      // {
      //   accessorKey: "payment_currency",
      //   header: "original_payment_currency",
      //   Cell: ({ row }) => <div>{row.original.payment_currency ?? ""}</div>,
      // },
      {
        accessorKey: "payment_source",
        header: "payment_source",
        Cell: ({ row }) => <div>{row.original.payment_source ?? ""}</div>,
      },
      {
        accessorKey: "payment_failure_code",
        header: "payment_failure_code",
        Cell: ({ row }) => <div>{row.original.payment_failure_code ?? ""}</div>,
      },
      {
        accessorKey: "payment_failure_message",
        header: "payment_failure_message",
        Cell: ({ row }) => (
          <div>{row.original.payment_failure_message ?? ""}</div>
        ),
      },
      // {
      //   accessorKey: "sst_supplier_name",
      //   header: "sst_supplier_name",
      //   filterVariant: "multi-select",
      //   Cell: ({ row }) => <div>{row.original.sst_supplier_name ?? ""}</div>,
      // },
    ],
    [activeViews]
  );

  const {
    data,
    isLoading: isLoadingDataItems,
    isError: isErrorLoadingDataItems,
  } = useList<IPayment, HttpError>();

  const data_items = data?.data ?? [];

  const [filteredDataItems, setFilteredDataItems] = useState(data_items);

  let customTableConfig = {
    initialState: {
      sorting: [{ id: "test_end_datetime", desc: true }],
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      columnPinning: {
        left: [
          "mrt-row-select",
          "mrt-row-expand",
          "mrt-row-actions",
          "payment_id",
        ],
      },
    },
  };
  return (
    <>
      <ReactMantineTableView
        data_columns={data_columns}
        resource="onewurld_payments"
        data_items={data_items}
        isLoadingDataItems={isLoadingDataItems}
        updateTableVisibility={updateTableVisibility}
        customTableConfig={customTableConfig}
      ></ReactMantineTableView>
    </>
  );
};
export default PageList;
