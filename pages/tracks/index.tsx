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
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
import {
  IconBrandSpotify,
  IconChartAreaFilled,
  IconCirclePlus,
  IconEdit,
  IconExternalLink,
  IconFilterCheck,
  IconList,
  IconMail,
} from "@tabler/icons-react";
import {
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
} from "@mantine/core";

import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MRT_TableInstance,
} from "mantine-react-table";
import { useAppStore } from "src/store";
import { ITrack } from "./interfaces";
import {
  IIdentity,
  IView,
  ColumnConfig,
  FilterCondition,
  ActiveView,
} from "@components/interfaces";
import dynamic from "next/dynamic";
import { IconDownload } from "@tabler/icons";
import CodeBlock from "@components/codeblock/codeblock";
import SelectTaskComponent from "@components/selecttask";

import AudioPlayer from "@components/audioplayer";
import { handleComingSoon } from "src/utils";
import { evaluateCondition } from "src/utils";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const invalidate = useInvalidate();

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
        .filter((option) =>
          option?.metadata?.resources?.some((resource: string) =>
            ["general", "tasks"].includes(resource)
          )
        )
    : [];

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

  // custom mutation
  const {
    mutate: customMutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  // Example function where the code snippet might be used
  function updateTableVisibility(
    tableInstance: MRT_TableInstance<ITrack>,
    columnsConfig: ColumnConfig[] | null
  ) {
    let visibility: Record<string, boolean> = {};
    let pinning: Record<"left" | "right", string[]> = { left: [], right: [] };

    // Reset logic when columnsConfig is null
    if (columnsConfig === null) {
      tableInstance.resetColumnVisibility();
    } else {
      visibility = tableInstance
        .getAllLeafColumns()
        .reduce<Record<string, boolean>>((acc, column) => {
          acc[column.id] = false;
          return acc;
        }, {});

      // Update visibility and construct pinning object based on config
      columnsConfig?.forEach((columnConfig) => {
        const { field_name, visible, pin } = columnConfig;
        visibility[field_name] = !!visible;

        // Only add to pinning if 'pin' key exists and it's set to 'left' or 'right'
        if (pin === "left" || pin === "right") {
          pinning[pin].push(field_name);
        }
      });

      // Update the table instance with the new visibility and pinning state
      tableInstance.setColumnVisibility(visibility);
      tableInstance.setColumnPinning(pinning);
    }
  }

  const track_columns = useMemo<MRT_ColumnDef<ITrack>[]>(
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
        Cell: ({ row }) => <div>{row.original.tempo ?? ""}</div>,
      },
      {
        accessorKey: "genre",
        header: "genre",
        Cell: ({ row }) => <div>{row.original.genre ?? ""}</div>,
      },
      {
        accessorKey: "goes_well_with",
        header: "goes_well_with",
        Cell: ({ row }) => <div>{row.original.goes_well_with ?? ""}</div>,
      },
    ],
    [activeViews]
  );

  const {
    data,
    isLoading: isLoadingOnewurldBooking,
    isError: isErrorOnewurldBooking,
  } = useList<ITrack, HttpError>();

  const data_items = data?.data ?? [];

  const [filteredDataItems, setFilteredDataItems] = useState(data_items);

  // useMantineReactTable hook
  const track_table = useMantineReactTable({
    columns: track_columns,
    data: filteredDataItems,
    enableRowSelection: true,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableRowActions: true,
    enableStickyHeader: true,
    enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enablePinning: true,
    enableEditing: true,
    editDisplayMode: "cell",
    enableStickyFooter: true,
    state: { isLoading: mutationIsLoading || isLoadingOnewurldBooking },
    mantineEditTextInputProps: ({ cell }) => ({
      //onBlur is more efficient, but could use onChange instead
      onBlur: (event) => {
        handleSaveCell(cell, event.target.value);
      },
    }),
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      columnPinning: { left: ["sst_booking_number"] },
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "lg",
    },
    mantineSearchTextInputProps: {
      placeholder: "Search Bookings",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },

    renderRowActions: ({ row }) => (
      <>
        <SelectTaskComponent
          action_options={action_options}
          identity={identity}
          action_step={null}
          record={row.original}
          data_items={filteredDataItems}
          open={open}
          setActionType={setActionType}
          variant="inline"
          activeActionOption={activeActionOption}
          setActiveActionOption={setActiveActionOption}
        />
      </>
    ),
    renderTopToolbar: ({ table }) => {
      const handleDelete = () => {
        table.getSelectedRowModel().flatRows.map((row) => {
          console.log("deleting " + row.getValue("pnr"));
        });
      };
      return (
        <Flex p="md" justify="space-between">
          <Flex gap="xs">
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            <Button
              // color="red"
              // disabled={!table.getIsSomeRowsSelected()}
              onClick={() => {
                // invalidate({
                //   resource: "views",
                //   invalidates: ["list"],
                // });
                setActionType("open_send");
                setOpened(true);
                // open();
              }}
              // disabled
              variant="outline"
              leftIcon={<IconMail />}
            >
              Send
            </Button>
            <Button
              // color="red"
              // disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              onClick={() => {
                // invalidate({
                //   resource: "views",
                //   invalidates: ["list"],
                // });
                setActionType("open_download");
                setOpened(true);
                // open();
              }}
              // disabled
              variant="outline"
              leftIcon={<IconDownload />}
            >
              Download
            </Button>
            <Button
              // color="red"
              // disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              onClick={() => {
                // setActionType("open_views");
                // open();
                setActionType("set_view");
                setActiveViews(null);
              }}
              // disabled
              variant="outline"
            >
              Clear Views
            </Button>
            <Button
              onClick={() => {
                setActionType("chat");
                open();
              }}
              // disabled
              variant="outline"
            >
              Chat
            </Button>
            <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              onClick={handleComingSoon}
              variant="filled"
            >
              Delete
            </Button>
          </Flex>
        </Flex>
      );
    },
    renderDetailPanel: ({ row }) => (
      <div>
        <CodeBlock jsonData={row.original} />
      </div>
    ),
  });

  const applyFilters = (activeView: ActiveView, data: any[]): any[] => {
    let filteredData = [...data];

    activeView.filters_configuration.forEach((group) => {
      if (group.group_operator === "OR") {
        // For 'OR' logic, ensure at least one condition within the group matches
        filteredData = filteredData.filter((item) =>
          group.conditions.some((condition) => {
            return evaluateCondition(item, condition);
          })
        );
      } else {
        // Default to 'AND' logic if no group_operator is specified
        group.conditions.forEach((condition) => {
          filteredData = filteredData.filter((item) => {
            return evaluateCondition(item, condition);
          });
        });
      }
    });

    return filteredData;
  };

  // When activeViews changes, apply filters
  useEffect(() => {
    // Listen for changes in the table's filter state
    const { columnFilters } = track_table.getState(); // if this is greater than 1 then apply it
    // console.log("columnFilters", columnFilters);
    if (activeViews === null) {
      setFilteredDataItems(data_items);
      updateTableVisibility(track_table, null); // Reset column visibility to default
    } else {
      // Existing logic for when activeViews is not null
      const newFilteredData = activeViews?.filters_configuration
        ? applyFilters(activeViews, data_items)
        : data_items;
      setFilteredDataItems(newFilteredData);
      updateTableVisibility(track_table, activeViews?.fields_configuration);

      let activeViewStats = {
        totalItems: filteredDataItems.length,
      };
    }
  }, [activeViews, data_items, track_table.getState().columnFilters]);

  const handleSaveCell = (cell: any, event: any) => {
    let update_values = {
      id: cell.row.original.related_record,
      [cell.column.id]: event,
    };
    let id = cell.row.original.related_record;
    customMutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/caesars_bookings/${id}`,
      method: "post",
      values: update_values,
      successNotification: (data, values) => {
        // invalidate list
        invalidate({
          resource: "caesars_bookings",
          invalidates: ["list"],
        });

        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when executing`,
          description: "Error",
          type: "error",
        };
      },
    });
  };

  return (
    <>
      <div>{/* <DynamicTextInput /> */}</div>
      <div className="w-max-screen">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center p-4 gap-4">
          <div className="hidden md:block"></div>{" "}
          {/* Empty div for spacing on medium and large screens */}
          <SelectTaskComponent
            data_items={filteredDataItems}
            action_options={action_options}
            identity={identity}
            action_step={null}
            record={null}
            open={open}
            setActionType={setActionType}
            activeActionOption={activeActionOption}
            setActiveActionOption={setActiveActionOption}
            // className="col-span-1 md:col-span-3 lg:col-span-1" // This ensures full width on small screens and centers on larger screens
          />
          <div className="hidden md:block"></div>{" "}
          {/* Empty div for spacing on medium and large screens */}
        </div>
        <MantineProvider
          theme={{
            colorScheme: "light",
            primaryColor: "blue",
          }}
        >
          <MantineReactTable table={track_table} />
        </MantineProvider>
      </div>
    </>
  );
};
export default PageList;
