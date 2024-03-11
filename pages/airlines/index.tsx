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
} from "@mantine/core";
import ReactDOM from "react-dom";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MRT_TableInstance,
} from "mantine-react-table";
import {
  addSeparator,
  formatDateTimeAsDate,
  formatDateTimeAsDateTime,
  updateTableVisibility,
} from "src/utils";
import { useAppStore } from "src/store";
import { DateInput, DatePicker } from "@mantine/dates";
import dynamic from "next/dynamic";
import { IconDownload } from "@tabler/icons";
import CodeBlock from "@components/codeblock/codeblock";
import SelectTaskComponent from "@components/selecttask";
import ReactMantineTableView from "@components/ReactMantineTableView";
import { IAirline } from "pages/airlines/interfaces";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  const {
    actionType,
    setActionType,
    activeViews,
    setActiveViews,
    opened: global_opened,
    setOpened,
    activeViewStats,
    setActiveViewStats,
    activeActionOption,
    setActiveActionOption,
  } = useAppStore();

  const data_columns = useMemo<MRT_ColumnDef<IAirline>[]>(
    () => [
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
                    resource: "airlines", // resource name or identifier
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
      {
        accessorKey: "airline_name",
        header: "airline_name",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "airlines", // resource name or identifier
                    action: "show",
                    id: row.original.id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.airline_name}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorKey: "airline_trip_page_url",
        header: "airline_trip_page_url",
        Cell: ({ row }) => {
          return (
            <Anchor href={row.original.airline_trip_page_url} target="_blank">
              {row.original.airline_trip_page_url ? "trip_page" : ""}
            </Anchor>
          );
        },
      },
      {
        accessorKey: "airline_customer_support_url",
        header: "airline_customer_support_url",
        Cell: ({ row }) => {
          return (
            <Anchor
              href={row.original.airline_customer_support_url}
              target="_blank"
            >
              {row.original.airline_customer_support_url
                ? "customer support"
                : ""}
            </Anchor>
          );
        },
      },
      {
        accessorKey: "airline_carrier_type",
        header: "airline_carrier_type",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.airline_carrier_type ?? ""}</div>,
      },
      {
        accessorKey: "airline_find_my_trip_section_label",
        header: "airline_find_my_trip_section_label",
        Cell: ({ row }) => (
          <div>{row.original.airline_find_my_trip_section_label ?? ""}</div>
        ),
      },
      {
        accessorFn: (row) => new Date(row?.created_at ?? ""),
        header: "created_at",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.created_at)}
          </Text>
        ),
      },

      {
        accessorFn: (row) => new Date(row?.updated_at ?? ""),
        header: "updated_at",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.updated_at)}
          </Text>
        ),
      },
    ],
    [activeViews]
  );

  const {
    data,
    isLoading: isLoadingDataItems,
    isError: isErrorLoadingDataItems,
  } = useList<IAirline, HttpError>();

  const data_items = data?.data ?? [];
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
          "test_id",
        ],
      },
    },
  };

  return (
    <>
      <ReactMantineTableView
        data_columns={data_columns}
        resource="airlines"
        data_items={data_items}
        isLoadingDataItems={isLoadingDataItems}
        updateTableVisibility={updateTableVisibility}
        customTableConfig={customTableConfig}
      ></ReactMantineTableView>
    </>
  );
};
export default PageList;
