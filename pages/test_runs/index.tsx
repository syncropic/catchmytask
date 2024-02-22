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
import { useDisclosure } from "@mantine/hooks";
import AddTo from "./AddTo";
import Chat from "./Chat";
import { useAppStore } from "src/store";
import { DateInput, DatePicker } from "@mantine/dates";
import dynamic from "next/dynamic";
import { IconDownload } from "@tabler/icons";
import CodeBlock from "@components/codeblock/codeblock";
import SelectTaskComponent from "@components/selecttask";
import ReactMantineTableView from "@components/ReactMantineTableView";
import { ITestRun } from "pages/test_runs/interfaces";

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

  const data_columns = useMemo<MRT_ColumnDef<ITestRun>[]>(
    () => [
      {
        accessorKey: "test_id",
        header: "test_id",
        Cell: ({ row }) => <div>{row.original.test_id ?? ""}</div>,
      },
      {
        accessorKey: "test_name",
        header: "test_name",
        Cell: ({ row }) => <div>{row.original.test_name ?? ""}</div>,
      },
      {
        accessorKey: "test_result",
        header: "test_result_summary",
        Cell: ({ row }) => <div>{row.original.test_result ?? ""}</div>,
      },
      {
        accessorKey: "test_result_url",
        header: "test_result_url",
        Cell: ({ row }) => {
          return (
            <Anchor href={row.original.test_result_url} target="_blank">
              {row.original.test_result_url ? "view_result" : ""}
            </Anchor>
          );
        },
      },
      {
        accessorKey: "test_intermediate_result_url",
        header: "test_intermediate_result_url",
        Cell: ({ row }) => {
          return (
            <Anchor
              href={row.original.test_intermediate_result_url}
              target="_blank"
            >
              {row.original.test_intermediate_result_url ? "view_result" : ""}
            </Anchor>
          );
        },
      },
      {
        accessorFn: (row) => new Date(row?.test_start_datetime ?? ""),
        header: "test_start_datetime",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.test_start_datetime)}
          </Text>
        ),
      },
      // {
      //   accessorFn: (row) => {
      //     const sDay = new Date(row?.test_end_datetime ?? "");
      //     sDay.setHours(0, 0, 0, 0);
      //     return sDay;
      //   },
      //   header: "test_end_datetime",
      //   filterVariant: "date-range",
      //   sortingFn: "datetime",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {formatDateTimeAsDateTime(row.original?.test_end_datetime)}
      //     </Text>
      //   ),
      // },
      {
        // accessorFn: (row) => {
        //   const sDay = new Date(row?.test_end_datetime ?? "");
        //   sDay.setHours(0, 0, 0, 0);
        //   return sDay;
        // },
        accessorFn: (row) => new Date(row?.test_end_datetime ?? ""),
        header: "test_end_datetime",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.test_end_datetime)}
          </Text>
        ),
      },
      {
        accessorKey: "test_duration_seconds",
        header: "test_duration_seconds",
        Cell: ({ row }) => (
          <div>{row.original.test_duration_seconds ?? ""}</div>
        ),
      },
      {
        accessorKey: "test_parameters_id",
        header: "test_parameters_id",
        Cell: ({ row }) => <div>{row.original.test_parameters_id ?? ""}</div>,
      },
      {
        accessorKey: "test_item_id",
        header: "test_item_id",
        Cell: ({ row }) => <div>{row.original.test_item_id ?? ""}</div>,
      },
    ],
    [activeViews]
  );

  const {
    data,
    isLoading: isLoadingDataItems,
    isError: isErrorLoadingDataItems,
  } = useList<ITestRun, HttpError>();

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
        resource="test_runs"
        data_items={data_items}
        isLoadingDataItems={isLoadingDataItems}
        updateTableVisibility={updateTableVisibility}
        customTableConfig={customTableConfig}
      ></ReactMantineTableView>
    </>
  );
};
export default PageList;
