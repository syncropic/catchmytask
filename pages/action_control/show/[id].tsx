import { Anchor, Text } from "@mantine/core";
import {
  HttpError,
  IResourceComponentsProps,
  useGo,
  useList,
  useOne,
  useParsed,
  useShow,
} from "@refinedev/core";
import { Show } from "@refinedev/mantine";
import { type MRT_ColumnDef } from "mantine-react-table";
import { ITestRun } from "pages/test_runs/interfaces";
import { IView } from "pages/views/interfaces";
import React, { useMemo } from "react";
import { useAppStore } from "src/store";
import { formatDateTimeAsDateTime } from "src/utils";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  // record
  const { id } = useParsed();
  const { queryResult } = useShow();
  const { data: dataRecord, isLoading } = queryResult;

  const record = dataRecord?.data;

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

  const {
    data: dataView,
    isLoading: isLoadingView,
    isError: isErrorView,
  } = useOne<IView, HttpError>({
    resource: "views",
    id: "views:u3nmcujfok427omee1wu",
  });

  const view = dataView?.data;
  // console.log("view", view);
  // // set active views with useeffect
  // useEffect(() => {
  //   setActiveViews({
  //     ...activeViews,
  //     show: true,
  //   });
  // }, [view]);

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
  } = useList<ITestRun, HttpError>({
    resource: "test_runs",
    // query: {
    //   filter: {
    //     test_id: id,
    //   },
    // },
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
          "test_id",
        ],
      },
    },
  };

  return (
    <>
      <Show isLoading={isLoading}>
        <div>show content</div>
      </Show>
    </>
  );
};
export default PageShow;
