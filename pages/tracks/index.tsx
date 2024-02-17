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
import { ITrack } from "./interfaces";
import { IconBrandSpotify, IconExternalLink } from "@tabler/icons-react";
import AudioPlayer from "@components/audioplayer";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  // const invalidate = useInvalidate();

  // const { activeActionOption, setActiveActionOption } = useAppStore();
  // IDENTITY
  // const { data: identity } = useGetIdentity<IIdentity>();
  // ACTION OPTIONS
  // const {
  //   data: actionOptionsData,
  //   isLoading: isLoadingActionOptionsData,
  //   isError: isErrorActionOptionsData,
  // } = useList({
  //   resource: "action_options",
  // });

  // const action_options = actionOptionsData?.data
  //   ? actionOptionsData?.data
  //       .map((option) => ({
  //         ...option,
  //         value: option.display_name,
  //         label: option.display_name,
  //         metadata: option.metadata,
  //       }))
  //       .filter((option) => option?.metadata?.resources?.includes("tracks"))
  //   : [];

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
  } = useAppStore();

  const data_columns = useMemo<MRT_ColumnDef<ITrack>[]>(
    () => [
      {
        accessorKey: "spotify_preview_url",
        header: "preview",
        enableColumnFilters: false,
        Cell: ({ row }) => (
          <AudioPlayer url={row.original.spotify_preview_url} />
        ),
      },
      {
        // accessorKey: "spotify_preview_url",
        header: "open_in",
        enableColumnFilters: false,
        Cell: ({ row }) => (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="filled" aria-label="Settings">
                <IconExternalLink
                  style={{ width: "70%", height: "70%" }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>External</Menu.Label>
              <Menu.Item
                icon={
                  <IconBrandSpotify
                    style={{ width: rem(14), height: rem(14) }}
                  />
                }
                component="a"
                href={row.original.spotify_external_url}
                target="_blank"
              >
                Spotify
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ),
      },
      {
        accessorKey: "name",
        header: "name",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "tracks",
                    action: "show",
                    id: row.original.id,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.name}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorKey: "tempo",
        header: "tempo",
        filterVariant: "range",
        Cell: ({ row }) => <div>{row.original.tempo ?? ""}</div>,
      },
      {
        accessorKey: "genre",
        header: "genre",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.genre ?? ""}</div>,
      },
      {
        accessorKey: "goes_well_with",
        header: "goes_well_with",
        filterVariant: "multi-select",
        Cell: ({ row }) => <div>{row.original.goes_well_with ?? ""}</div>,
      },
    ],
    [activeViews]
  );

  const {
    data,
    isLoading: isLoadingDataItems,
    isError: isErrorLoadingDataItems,
  } = useList<ITrack, HttpError>();

  const data_items = data?.data ?? [];
  // console.log("data_items", data_items);

  const [filteredDataItems, setFilteredDataItems] = useState(data_items);

  return (
    <>
      <ReactMantineTableView
        data_columns={data_columns}
        resource="tracks"
        data_items={data_items}
        isLoadingDataItems={isLoadingDataItems}
        updateTableVisibility={updateTableVisibility}
        initialStateColumnPinningLeft={["id"]}
      ></ReactMantineTableView>
    </>
  );
};
export default PageList;
