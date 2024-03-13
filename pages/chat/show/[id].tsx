import {
  IResourceComponentsProps,
  useShow,
  useOne,
  useCustomMutation,
  useGetIdentity,
  useDelete,
  useGo,
} from "@refinedev/core";
import { Show, TextField, DateField } from "@refinedev/mantine";
import {
  Accordion,
  Anchor,
  Flex,
  MantineProvider,
  Title,
  rem,
} from "@mantine/core";
import React, { useEffect, useMemo, useState } from "react";
import { GetManyResponse, useMany, useList, HttpError } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconCirclePlus,
  IconEdit,
  IconList,
  IconMathFunction,
  IconMessageCircle,
  IconSend,
  IconTrash,
} from "@tabler/icons-react";
import {
  ScrollArea,
  Table,
  Pagination,
  Group,
  Menu,
  Box,
  ActionIcon,
  Text,
  Code,
  Button,
} from "@mantine/core";
import { List, EditButton, ShowButton, DeleteButton } from "@refinedev/mantine";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
} from "mantine-react-table";
import { useParsed } from "@refinedev/core";
import {
  addSeparator,
  formatDateTimeAsDate,
  formatDateTimeAsDateTime,
  updateTableVisibility,
} from "src/utils";
import CodeBlock from "src/components/codeblock/codeblock";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ListMessages from "@components/message/ListItems";
import WriteMessagesForm from "@components/message/WriteItemForm";
import { parseISO, format } from "date-fns";
import { useInvalidate } from "@refinedev/core";
import { renderOperationDetails } from "src/components/actionstep";
import { useAppStore } from "src/store";
import { ITestRun } from "pages/test_runs/interfaces";
import ReactMantineTableView from "@components/ReactMantineTableView";
import { IView } from "pages/views/interfaces";

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
        {/* <Text>
          <b>Id:</b> {record?.id}
        </Text>
        
        <Accordion defaultValue="actions">
          <Accordion.Item key="details" value="details">
            <Accordion.Control icon={<IconList />}>
              More details
            </Accordion.Control>
            <Accordion.Panel>
              <CodeBlock jsonData={data} />
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item key="actions" value="actions">
            <Accordion.Control icon={<IconMathFunction />}>
              Runs
            </Accordion.Control>
            <Accordion.Panel>
              <ReactMantineTableView
                data_columns={data_columns}
                view={view}
                resource="test_runs"
                data_items={data_items}
                isLoadingDataItems={isLoadingDataItems}
                updateTableVisibility={updateTableVisibility}
                customTableConfig={customTableConfig}
              ></ReactMantineTableView>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion> */}
      </Show>
    </>
  );
};
export default PageShow;
