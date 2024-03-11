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
import { ITrip } from "pages/trips/interfaces";
import Reveal from "@components/Reveal";

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

  const data_columns = useMemo<MRT_ColumnDef<ITrip>[]>(
    () => [
      {
        accessorKey: "trip_id",
        header: "trip_id",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "trips",
                    action: "show",
                    id: row.original.trip_id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.trip_id}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorKey: "departure_location",
        header: "departure_location",
        Cell: ({ row }) => <div>{row.original.departure_location ?? ""}</div>,
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.departure_datetime ?? "");
          sDay.setHours(0, 0, 0, 0);
          return sDay;
        },
        header: "departure_datetime",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.departure_datetime)}
          </Text>
        ),
      },
      {
        accessorKey: "arrival_location",
        header: "arrival_location",
        Cell: ({ row }) => <div>{row.original.arrival_location ?? ""}</div>,
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.return_datetime ?? "");
          sDay.setHours(0, 0, 0, 0);
          return sDay;
        },
        header: "return_datetime",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.return_datetime)}
          </Text>
        ),
      },
      {
        accessorKey: "is_roundtrip",
        header: "is_roundtrip",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.is_roundtrip ?? ""}</div>,
      },
      {
        accessorKey: "trip_passengers",
        header: "trip_passengers",
        filterVariant: "multi-select",
        Cell: ({ row }) => {
          return (
            <Reveal
              data={row.original.trip_passengers}
              resource="passengers"
            ></Reveal>
          );
        },
      },
      {
        accessorKey: "flight_segments",
        header: "flight_segments",
        // filterVariant: "multi-select",
        Cell: ({ row }) => {
          return (
            <Reveal
              data={row.original.flight_segments}
              resource="flight_segments"
            ></Reveal>
          );
        },
      },
      {
        accessorKey: "hotel_segments",
        header: "hotel_segments",
        // filterVariant: "multi-select",
        Cell: ({ row }) => {
          return (
            <Reveal
              data={row.original.hotel_segments}
              resource="hotel_segments"
            ></Reveal>
          );
        },
      },
      {
        accessorKey: "payment_methods",
        header: "payment_methods",
        // filterVariant: "multi-select",
        Cell: ({ row }) => {
          return (
            <Reveal
              data={row.original.payment_methods}
              resource="payment_methods"
            ></Reveal>
          );
        },
      },
      {
        accessorKey: "trip_author",
        header: "trip_author",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.trip_author ?? ""}</div>,
      },
      {
        accessorFn: (row) => new Date(row?.trip_created_date ?? ""),
        header: "trip_created_date",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.trip_created_date)}
          </Text>
        ),
      },
      {
        accessorFn: (row) => new Date(row?.trip_updated_date ?? ""),
        header: "trip_updated_date",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDateTime(row.original?.trip_updated_date)}
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
  } = useList<ITrip, HttpError>({
    resource: "trips",
  });

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
          "trip_id",
        ],
      },
    },
  };

  return (
    <>
      <ReactMantineTableView
        data_columns={data_columns}
        resource="trips"
        data_items={data_items}
        isLoadingDataItems={isLoadingDataItems}
        updateTableVisibility={updateTableVisibility}
        customTableConfig={customTableConfig}
      ></ReactMantineTableView>
    </>
  );
};
export default PageList;
