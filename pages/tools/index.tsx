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
import { ITool } from "./interfaces";

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
        .filter((option) => option?.metadata?.resources?.includes("tools"))
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

  const data_columns = useMemo<MRT_ColumnDef<ITool>[]>(
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
                    resource: "tool",
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
        accessorKey: "name",
        header: "name",
        Cell: ({ row }) => <div>{row.original.name ?? ""}</div>,
      },
      {
        accessorKey: "docs_url",
        header: "docs_url",
        Cell: ({ row }) => {
          return (
            <Anchor href={row.original.docs_url ?? ""} target="_blank">
              {row.original.docs_url ?? ""}
            </Anchor>
          );
        },
      },
      {
        accessorKey: "homepage_url",
        header: "homepage_url",
        Cell: ({ row }) => {
          return (
            <Anchor href={row.original.homepage_url ?? ""} target="_blank">
              {row.original.homepage_url ?? ""}
            </Anchor>
          );
        },
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.created_at);
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "created_at",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.created_at)}
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
  } = useList<ITool, HttpError>();

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
        left: ["mrt-row-select", "mrt-row-expand", "mrt-row-actions", "id"],
      },
    },
  };
  return (
    <>
      <ReactMantineTableView
        data_columns={data_columns}
        resource="tool"
        data_items={data_items}
        isLoadingDataItems={isLoadingDataItems}
        updateTableVisibility={updateTableVisibility}
        customTableConfig={customTableConfig}
      ></ReactMantineTableView>
    </>
  );
};
export default PageList;
