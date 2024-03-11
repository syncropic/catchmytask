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
import { Text, Button, Flex, Anchor } from "@mantine/core";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
} from "mantine-react-table";
import {
  formatDateTimeAsDate,
  getCellStyleInline,
  updateTableVisibility,
} from "src/utils";
import { useDisclosure } from "@mantine/hooks";
import { useAppStore } from "src/store";
import { IOnewurldBooking } from "pages/onewurld_bookings/interfaces";

import { TableViewComponentProps } from "@components/interfaces";
import ReactMantineTableView from "@components/ReactMantineTableView";
import { useDataColumns } from "@components/Utils";

export function TableView({ resource, data_columns, activeQueryResults }) {
  const data_columns_enhanced = useDataColumns(data_columns);
  console.log("data_columns_enhanced", data_columns_enhanced);
  // const go = useGo();
  // const {
  //   actionType,
  //   setActionType,
  //   activeViews,
  //   setActiveViews,
  //   opened: global_opened,
  //   setOpened,
  //   activeViewStats,
  //   setActiveViewStats,
  // } = useAppStore();

  // const {
  //   data,
  //   isLoading: isLoadingDataItems,
  //   isError: isErrorLoadingDataItems,
  // } = useList<IOnewurldBooking, HttpError>({
  //   resource: "onewurld_bookings",
  // });

  // const data_items = data?.data ?? [];
  // console.log("data_items", data_items);

  let customTableConfig = {
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      columnPinning: {
        left: ["mrt-row-select", "mrt-row-expand", "mrt-row-actions"],
      },
    },
  };

  return (
    <>
      <ReactMantineTableView
        data_columns={data_columns_enhanced}
        resource={resource}
        data_items={activeQueryResults?.data ?? []}
        isLoadingDataItems={false}
        updateTableVisibility={updateTableVisibility}
        customTableConfig={customTableConfig}
      ></ReactMantineTableView>
    </>
  );
}
export default TableView;
