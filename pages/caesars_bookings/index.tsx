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
  IconChartAreaFilled,
  IconCirclePlus,
  IconEdit,
  IconFilterCheck,
  IconList,
  IconMail,
  IconMessageCircle,
  IconPlus,
  IconSend,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
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
} from "src/utils";
import { useDisclosure } from "@mantine/hooks";
import AddTo from "./AddTo";
import Chat from "./Chat";
import { useAppStore } from "src/store";
import { DateInput, DatePicker } from "@mantine/dates";
import { IBooking, IView, IIdentity, ColumnConfig, Column } from "./interfaces";
import dynamic from "next/dynamic";
import { IconDownload } from "@tabler/icons";
import CodeBlock from "@components/codeblock/codeblock";
import SelectTaskComponent from "@components/selecttask";

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
          option?.metadata?.resources?.includes("caesars_bookings")
        )
    : [];

  const go = useGo();
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
    activeActionOption,
    setActiveActionOption,
  } = useAppStore();

  // custom mutation
  const {
    mutate: customMutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();

  // additions
  const {
    data: views_data,
    isLoading: isLoadingViewsData,
    isError: isErrorViewsData,
  } = useList<IView, HttpError>({
    resource: "views",
  });

  const views = views_data?.data ?? [];

  // Example function where the code snippet might be used
  function updateTableVisibility(
    tableInstance: MRT_TableInstance<IBooking>,
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

  const booking_columns = useMemo<MRT_ColumnDef<IBooking>[]>(
    () => [
      {
        accessorKey: "sst_internal_id",
        header: "sst_internal_id",
        Cell: ({ row }) => (
          <Anchor component={Text}>
            <Text
              size="sm"
              onClick={() => {
                go({
                  to: {
                    resource: "caesars_bookings",
                    action: "show",
                    id: row.original.related_record,
                  },
                  type: "push",
                });
              }}
            >
              {row.original.sst_internal_id}
            </Text>
          </Anchor>
        ),
      },
      {
        accessorKey: "sst_booking_full_name",
        header: "sst_booking_full_name",
        Cell: ({ row }) => (
          <div>{row.original.sst_booking_full_name ?? ""}</div>
        ),
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.sst_created_date_pst ?? "");
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "sst_created_date_pst",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.sst_created_date_pst)}
          </Text>
        ),
      },
      {
        accessorFn: (row) => {
          const sDay = new Date(row?.sst_departure_date_pst ?? "");
          sDay.setHours(0, 0, 0, 0); // remove time from date (useful if filter by equals exact date)
          return sDay;
        },
        header: "sst_departure_date_pst",
        filterVariant: "date-range",
        sortingFn: "datetime",
        Cell: ({ row }) => (
          <Text size="sm">
            {formatDateTimeAsDate(row.original?.sst_departure_date_pst)}
          </Text>
        ),
      },
      {
        accessorKey: "flight_pnr",
        header: "flight_pnr",
        Cell: ({ row }) => <div>{row.original.flight_pnr ?? ""}</div>,
      },
      {
        accessorKey: "flight_airline_reference_code",
        header: "flight_airline_reference_code",
        // filterVariant: "multi-select",
        Cell: ({ row }) => (
          <div>{row.original.flight_airline_reference_code ?? ""}</div>
        ),
      },
      {
        accessorKey: "flight_confirmation_message",
        header: "flight_confirmation_message",
        Cell: ({ row }) => {
          return (
            <Anchor
              href={row.original.flight_confirmation_message_url}
              target="_blank"
            >
              {row.original.flight_confirmation_message ?? ""}
            </Anchor>
          );
        },
      },
    ],
    [activeViews]
  );

  const {
    data,
    isLoading: isLoadingOnewurldBooking,
    isError: isErrorOnewurldBooking,
  } = useList<IBooking, HttpError>();

  const data_items = data?.data ?? [];

  // const data_items = data?.data.map((item) => defaultStringValues(item)) ?? [];

  const [filteredDataItems, setFilteredDataItems] = useState(data_items);

  // useMantineReactTable hook
  const booking_table = useMantineReactTable({
    columns: booking_columns,
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
        // console.log(cell.getValue());
        // console.log(cell, event.target.value);
        handleSaveCell(cell, event.target.value);
        // console.log(cell, event.target.value);
      },
    }),
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      columnPinning: { left: ["sst_booking_number"] },
      // grouping: ["sst_status_and_supplier_status_comparison"], //group by location and department by default and expand grouped rows
      // expanded: true, //show grouped rows by default
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
          open={open}
          close={close}
          opened={opened}
          data_items={[]}
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
              // onClick={handleDelete}
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
              // color="red"
              // disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
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

  const handleComingSoon = () => {
    alert("Coming Soon");
  };

  // FILTERING WITH VIEWS
  interface FilterCondition {
    field_name: string; // Correct placement
    type: "exclude" | "include" | "not_equals" | "range";
    values?: string[]; // Assuming values are strings; adjust as necessary
    range_start?: string;
    range_end?: string;
  }

  interface ConditionGroup {
    group_operator?: "AND" | "OR";
    conditions: FilterCondition[];
  }

  interface ActiveView {
    filters_configuration: ConditionGroup[];
  }

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

  function evaluateCondition(item: any, condition: FilterCondition): boolean {
    switch (condition.type) {
      case "exclude":
        // If condition.values is undefined, default to false to indicate the item does not match the exclusion criteria
        return condition.values
          ? !condition.values.includes(item[condition.field_name])
          : false;
      case "include":
        // If condition.values is undefined, default to false as there are no values to include the item by
        return condition.values
          ? condition.values.includes(item[condition.field_name])
          : false;
      case "not_equals":
        // Similar logic as "exclude"
        return condition.values
          ? !condition.values.includes(item[condition.field_name])
          : false;
      case "range":
        const value = new Date(item[condition.field_name]);
        const start = new Date(condition.range_start!); // Assuming range_start and range_end are always provided for "range" type
        const end = new Date(condition.range_end!);
        return value >= start && value <= end;
      default:
        return true; // Default case to include the item if condition type is unknown
    }
  }

  // When activeViews changes, apply filters
  useEffect(() => {
    // Reset filtered data and column visibility when activeViews is null
    if (activeViews === null) {
      // let activeViewStats = {
      //   totalItems: data_items.length,
      // };
      // setActiveViewStats(activeViewStats);
      // console.log("activeViewStats", activeViewStats);

      setFilteredDataItems(data_items);
      updateTableVisibility(booking_table, null); // Reset column visibility to default
    } else {
      // Existing logic for when activeViews is not null
      const newFilteredData = activeViews?.filters_configuration
        ? applyFilters(activeViews, data_items)
        : data_items;
      setFilteredDataItems(newFilteredData);
      updateTableVisibility(booking_table, activeViews?.fields_configuration);

      let activeViewStats = {
        totalItems: filteredDataItems.length,
      };
      // console.log("activeViewStats", activeViewStats);
      // setActiveViewStats(activeViewStats);
    }
  }, [activeViews, data_items]);

  const handleSaveCell = (cell: any, event: any) => {
    let update_values = {
      id: cell.row.original.related_record,
      [cell.column.id]: event,
    };
    // console.log("update_values", update_values);
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
            action_options={action_options}
            identity={identity}
            action_step={null}
            record={null}
            open={open}
            close={close}
            opened={opened}
            data_items={[]}
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
          <MantineReactTable table={booking_table} />
        </MantineProvider>
      </div>
    </>
  );
};
export default PageList;
