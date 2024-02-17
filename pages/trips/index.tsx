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
        Cell: ({ row }) => <div>{row.original.trip_id ?? ""}</div>,
      },
      {
        accessorKey: "flight_id",
        header: "flight_id",
        Cell: ({ row }) => <div>{row.original.flight_id ?? ""}</div>,
      },
      // {
      //   accessorKey: "flight_confirmation_message",
      //   header: "flight_confirmation_message",
      //   Cell: ({ row }) => {
      //     return (
      //       <Anchor
      //         href={row.original.flight_confirmation_message_url}
      //         target="_blank"
      //       >
      //         {row.original.flight_confirmation_message ?? ""}
      //       </Anchor>
      //     );
      //   },
      // },
      // {
      //   accessorKey: "flight_change_message",
      //   header: "flight_change_message",
      //   Cell: ({ row }) => {
      //     return (
      //       <Anchor
      //         href={row.original.flight_change_message_url}
      //         target="_blank"
      //       >
      //         {row.original.flight_change_message ?? ""}
      //       </Anchor>
      //     );
      //   },
      // },
      // {
      //   accessorKey: "booking_type",
      //   header: "booking_type",
      //   filterVariant: "multi-select",
      //   Cell: ({ row }) => <div>{row.original.booking_type ?? ""}</div>,
      // },
      // {
      //   accessorKey: "sst_itinerary_page_url",
      //   header: "sst_trip_page",
      //   Cell: ({ row }) => {
      //     return (
      //       <Anchor href={row.original.sst_itinerary_page_url} target="_blank">
      //         {row.original.sst_itinerary_page_url ? "open" : ""}
      //       </Anchor>
      //     );
      //   },
      // },
      // {
      //   accessorKey: "sst_internal_id",
      //   header: "sst_internal_id",
      //   Cell: ({ row }) => (
      //     <Anchor component={Text}>
      //       <Text
      //         size="sm"
      //         onClick={() => {
      //           go({
      //             to: {
      //               resource: "caesars_bookings",
      //               action: "show",
      //               id: row.original.related_record,
      //             },
      //             type: "push",
      //           });
      //         }}
      //       >
      //         {row.original.sst_internal_id}
      //       </Text>
      //     </Anchor>
      //   ),
      // },
      // {
      //   accessorKey: "sst_booking_full_name",
      //   header: "sst_booking_full_name",
      //   Cell: ({ row }) => (
      //     <div>{row.original.sst_booking_full_name ?? ""}</div>
      //   ),
      // },
      {
        accessorKey: "flight_departure_airport",
        header: "flight_departure_airport",
        Cell: ({ row }) => (
          <div>{row.original.flight_departure_airport ?? ""}</div>
        ),
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.flight_departure_datetime ?? "");
          sDay.setHours(0, 0, 0, 0);
          return sDay;
        },
        header: "flight_departure_datetime",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.flight_departure_datetime)}
          </Text>
        ),
      },
      {
        accessorKey: "flight_arrival_airport",
        header: "flight_arrival_airport",
        Cell: ({ row }) => (
          <div>{row.original.flight_arrival_airport ?? ""}</div>
        ),
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.flight_arrival_datetime ?? "");
          sDay.setHours(0, 0, 0, 0);
          return sDay;
        },
        header: "flight_arrival_datetime",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.flight_arrival_datetime)}
          </Text>
        ),
      },
      {
        accessorKey: "flight_direction",
        header: "flight_direction",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.flight_direction ?? ""}</div>,
      },
      {
        accessorKey: "flight_booking_class",
        header: "flight_booking_class",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.flight_booking_class ?? ""}</div>,
      },
      // {
      //   accessorFn: (row) => {
      //     const sDay = new Date(row?.sst_departure_date_pst ?? "");
      //     sDay.setHours(0, 0, 0, 0);
      //     return sDay;
      //   },
      //   header: "sst_departure_date_pst",
      //   filterVariant: "date-range",
      //   sortingFn: "datetime",
      //   Cell: ({ row }) => (
      //     <Text size="sm">
      //       {formatDateTimeAsDate(row.original?.sst_departure_date_pst)}
      //     </Text>
      //   ),
      // },
      // {
      //   accessorKey: "flight_airline_reference_code",
      //   header: "flight_airline_reference_code",
      //   Cell: ({ row }) => (
      //     <div>{row.original.flight_airline_reference_code ?? ""}</div>
      //   ),
      // },

      // {
      //   accessorKey: "flight_change_assigned_agent",
      //   header: "flight_change_assigned_agent",
      //   filterVariant: "multi-select",
      //   Cell: ({ row }) => (
      //     <div>{row.original.flight_change_assigned_agent ?? ""}</div>
      //   ),
      // },
      // {
      //   accessorKey: "flight_change_status",
      //   header: "flight_change_status",
      //   filterVariant: "multi-select",
      //   Cell: ({ row }) => <div>{row.original.flight_change_status ?? ""}</div>,
      // },
      // {
      //   accessorKey: "flight_change_type",
      //   header: "flight_change_type",
      //   filterVariant: "multi-select",
      //   Cell: ({ row }) => <div>{row.original.flight_change_type ?? ""}</div>,
      // },
      // {
      //   accessorKey: "hotel_pnr",
      //   header: "hotel_pnr",
      //   Cell: ({ row }) => <div>{row.original.hotel_pnr ?? ""}</div>,
      // },
      // {
      //   accessorKey: "carrier_type",
      //   header: "carrier_type",
      //   filterVariant: "multi-select",
      //   Cell: ({ row }) => <div>{row.original.carrier_type ?? ""}</div>,
      // },
    ],
    [activeViews]
  );

  const {
    data,
    isLoading: isLoadingDataItems,
    isError: isErrorLoadingDataItems,
  } = useList<ITrip, HttpError>();

  const data_items = data?.data ?? [];

  return (
    <>
      <ReactMantineTableView
        data_columns={data_columns}
        resource="trips"
        data_items={data_items}
        isLoadingDataItems={isLoadingDataItems}
        updateTableVisibility={updateTableVisibility}
        initialStateColumnPinningLeft={[
          "mrt-row-select",
          "mrt-row-expand",
          "mrt-row-actions",
          "sst_internal_id",
        ]}
      ></ReactMantineTableView>
    </>
  );
};
export default PageList;
