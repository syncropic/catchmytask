import React, { use, useMemo, useState } from "react";
import {
  IResourceComponentsProps,
  useGo,
  useCustomMutation,
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
  Tooltip,
  Drawer,
  Checkbox,
} from "@mantine/core";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_ToggleFiltersButton,
  MRT_GlobalFilterTextInput,
} from "mantine-react-table";
import { addSeparator } from "src/utils";
// import loadTrack from "./loadTrack";
import { useAppStore } from "src/store";
import { getDb } from "src/catchmyvibe-api-provider/db";

// Define the data structure
interface IFeedback {
  id: string;
  name: string;
  artist: string;
}

export const SyncFilesFeedback: React.FC<IResourceComponentsProps> = () => {
  const go = useGo();
  // const { mutate, isLoading, isError } = useCustomMutation();
  const activeItem = useAppStore((state) => state.activeItem);

  interface PostUniqueCheckResponse {
    isAvailable: boolean;
  }

  // const apiUrl = useApiUrl();
  const catchmyvibeDb = getDb();

  const syncFiles = useAppStore((state) => state.syncFiles);
  // console.log("activeItem", activeItem);

  const data_items = syncFiles.filter(
    (syncFile) => syncFile.resource_id === activeItem?.id
  );

  const handleAddTo = async (event: any, row: any) => {
    // console.log("adding to");
    // console.log(event.currentTarget.checked);
    // console.log(activeItem);
    // console.log(row);
    // useCustom({
    //   dataProviderName: "second-data-provider",
    // });
    let Query = "";
    const row_id = addSeparator(row?.id, "views");
    const activeItem_id = addSeparator(activeItem?.id, "music");
    if (event.currentTarget.checked) {
      Query = `RELATE ${row_id}->displays->${activeItem_id} SET created_at = time::now(), updated_at = time::now();`;
    } else {
      Query = `DELETE '${row_id}'->displays WHERE out='${activeItem_id}';`;
    }
    // console.log(Query);
    const results = await catchmyvibeDb.query(Query);
    console.log(results);
    // console.log(Query);
    // console.log(catchmyvibeDb);

    // setChecked(event.currentTarget.checked);
    // use custom mutation to relate activeItem to row or to remove relation
  };

  const columns = useMemo<MRT_ColumnDef<IFeedback>[]>(
    () => [
      {
        id: "actions",
        accessorKey: "id",
        enableColumnFilter: false,
        header: "quick actions",
        Cell: ({ renderedCellValue, row }) => (
          <Group spacing="xs" noWrap>
            <Checkbox
              size="xs"
              onChange={(event) => handleAddTo(event, row.original)}
            ></Checkbox>
          </Group>
        ),
      },
      {
        accessorKey: "name",
        header: "name",
        Cell: ({ row }) => (
          <Text
            size="sm"
            color="gray"
            onClick={() => {
              go({
                to: {
                  resource: "views", // resource name or identifier
                  action: "show",
                  id: row.original.id,
                },
                type: "push",
              });
            }}
          >
            {row.original.name}
          </Text>
        ),
      },
      {
        accessorKey: "artist",
        header: "artist",
        Cell: ({ row }) => (
          <Text
            size="sm"
            color="gray"
            onClick={() => {
              go({
                to: {
                  resource: "views", // resource name or identifier
                  action: "show",
                  id: row.original.id,
                },
                type: "push",
              });
            }}
          >
            {row.original.artist}
          </Text>
        ),
      },
    ],
    []
  );

  // const {
  //   data,
  //   isLoading: isLoadingMusic,
  //   isError: isErrorMusic,
  // } = useList<IView, HttpError>({
  //   meta: {
  //     fields: ["id", "name"],
  //   },
  //   resource: "views",
  //   dataProviderName: "catchmyvibeApiDataProvider",
  // });

  // const data_items = data?.data ?? [];

  // useMantineReactTable hook
  const table = useMantineReactTable({
    columns,
    data: data_items,
    // enableRowSelection: true,
    enableColumnOrdering: false,
    enableGlobalFilter: false,
    // enableColumnFilters: true,
    // enableRowActions: true,
    enableStickyHeader: true,
    initialState: {
      density: "xs",
      showGlobalFilter: false,
      showColumnFilters: true,
      // pagination: { pageSize: 30, pageIndex: 0 },
    },
  });
  return (
    <div className="w-max-screen">
      {/* <div>{JSON.stringify(data_items)}</div> */}
      {/* <MantineReactTable table={table} /> */}
    </div>
  );
};
export default SyncFilesFeedback;
