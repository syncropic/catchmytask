import CodeBlock from "@components/codeblock/codeblock";
import {
  TabularViewComponentProps,
  IIdentity,
  FilterCondition,
  ActiveView,
  ColumnConfig,
} from "@components/interfaces";
import SelectTaskComponent from "@components/selecttask";
import {
  Box,
  Button,
  Drawer,
  Flex,
  MantineProvider,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  useCustomMutation,
  useGetIdentity,
  useGo,
  useInvalidate,
  useList,
} from "@refinedev/core";
import { IconDownload, IconMail } from "@tabler/icons";
import {
  MRT_GlobalFilterTextInput,
  MRT_TableInstance,
  MRT_ToggleFiltersButton,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { addSeparator, evaluateCondition } from "src/utils";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Chat from "@components/Chat";
import Sync from "@components/Sync";

export function ReactMantineTableView<T extends Record<string, any>>({
  data_columns,
  resource,
  data_items,
  isLoadingDataItems,
  updateTableVisibility,
  initialStateColumnPinningLeft,
}: TabularViewComponentProps<T>) {
  // VALIDATE
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
    dataProviderName: "default",
  });

  const action_options = actionOptionsData?.data
    ? actionOptionsData?.data
        .map((option) => ({
          ...option,
          value: option.display_name,
          label: option.display_name,
          metadata: option.metadata,
          name: option.name,
        }))
        .filter((option) => option?.metadata?.resources?.includes(resource))
    : [];

  console.log("action_options", action_options);

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

  const [filteredDataItems, setFilteredDataItems] = useState(data_items);

  // useMantineReactTable hook
  const data_table = useMantineReactTable<T>({
    columns: data_columns,
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
    // enableColumnResizing: true,
    // layoutMode: "grid",
    // mantineTableHeadCellProps: {
    //   sx: {
    //     flex: "0 0 auto",
    //   },
    // },
    // mantineTableBodyCellProps: {
    //   sx: {
    //     flex: "0 0 auto",
    //   },
    // },
    displayColumnDefOptions: {
      "mrt-row-actions": { minSize: 250, maxSize: 250, size: 250 },
    }, //change width of actions column to 300px
    state: { isLoading: mutationIsLoading || isLoadingDataItems },
    mantineEditTextInputProps: ({ cell }) => ({
      onBlur: (event) => {
        handleSaveCell(cell, event.target.value);
      },
    }),
    initialState: {
      density: "xs",
      showGlobalFilter: true,
      showColumnFilters: true,
      pagination: { pageSize: 30, pageIndex: 0 },
      columnPinning: { left: initialStateColumnPinningLeft },
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    mantinePaginationProps: {
      radius: "xl",
      size: "lg",
    },
    mantineSearchTextInputProps: {
      placeholder: "Search Items",
    },
    mantineTableContainerProps: { sx: { maxHeight: "500px" } },
    // mantineTableProps: {
    //   sx: {
    //     tableLayout: "fixed",
    //   },
    // },

    renderRowActions: ({ row }) => (
      <SelectTaskComponent
        action_options={action_options}
        identity={identity}
        action_step={null}
        record={row.original}
        data_table={data_table}
        data_items={[]}
        setActionType={setActionType}
        variant="inline"
        activeActionOption={activeActionOption}
        setActiveActionOption={setActiveActionOption}
      />
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
              onClick={() => {
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
              onClick={() => {
                // setActionType("open_download");
                // setOpened(true);
                // open();
                handleDownload(table.getFilteredRowModel().flatRows);
              }}
              // disabled
              variant="outline"
              leftIcon={<IconDownload />}
            >
              Download
            </Button>
            <Button
              onClick={() => {
                // setActionType("open_views");
                // open();
                setActionType("set_view");
                setActiveViews(null);
              }}
              // disabled
              variant={activeViews?.name ? "light" : "outline"}
            >
              {activeViews?.name ? "Clear View" : "No View Selected"}
            </Button>
            <Button
              onClick={() => {
                table.setColumnFilters([]);
              }}
              // disabled
              variant={
                table.getState().columnFilters.length > 0 ? "light" : "outline"
              }
            >
              {table.getState().columnFilters.length > 0
                ? `Clear ${table.getState().columnFilters.length} Filters`
                : "No Filters Applied"}
              {/* {JSON.stringify(table.getState().columnFilters)} */}
            </Button>
            <Button
              onClick={() => {
                setActionType("sync");
                const item = action_options.find(
                  (item) => item.name === "sync"
                );
                setActiveActionOption(item);
                open();
              }}
              // disabled
              variant="outline"
            >
              Sync
            </Button>
            <Button
              onClick={() => {
                setActionType("chat");
                const item = action_options.find(
                  (item) => item.name === "chat"
                );
                setActiveActionOption(item);
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
              //   onClick={handleComingSoon}
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
        <div>
          <Text>
            <b>Flight Change Remarks:</b> {row.original.flight_change_remarks}
          </Text>
          <p>
            <b>Old PNR text:</b>
            <pre>{row.original.flight_change_pnr_old_text}</pre>
          </p>
          <p>
            <b>New PNR Text:</b>
            <pre>{row.original.flight_change_pnr_new_text}</pre>
          </p>
        </div>
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
    // Reset filtered data and column visibility when activeViews is null
    if (activeViews === null) {
      setFilteredDataItems(data_items);
      updateTableVisibility(data_table, null); // Reset column visibility to default
    } else {
      // Existing logic for when activeViews is not null
      const newFilteredData = activeViews?.filters_configuration
        ? applyFilters(activeViews, data_items)
        : data_items;
      setFilteredDataItems(newFilteredData);
      updateTableVisibility(data_table, activeViews?.fields_configuration);

      let activeViewStats = {
        totalItems: filteredDataItems.length,
      };
    }
  }, [activeViews, data_items]);

  useEffect(() => {
    const columnFilters = data_table.getState().columnFilters;
    const filtered_items = data_table.getFilteredRowModel().flatRows;
    if (columnFilters.length > 0 && filtered_items.length === 0) {
      console.log("Column filters array has items.", columnFilters);
      console.log("Filtered items array has 0 items.");
      handleAddToCollection(resource, columnFilters);
    }
  }, [data_table.getState().columnFilters]); // Dependency array

  const handleSaveCell = (cell: any, event: any) => {
    let update_values = {
      id: cell.row.original.related_record,
      [cell.column.id]: event,
    };
    // console.log("update_values", update_values);
    let id = cell.row.original.related_record;
    customMutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/${resource}/${id}`,
      method: "post",
      values: update_values,
      successNotification: (data, values) => {
        // invalidate list
        invalidate({
          resource: resource,
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

  const handleAddToCollection = (resource: any, filters: any) => {
    // let update_values = {
    //   id: cell.row.original.related_record,
    //   [cell.column.id]: event,
    // };
    // // console.log("update_values", update_values);
    // let id = cell.row.original.related_record;
    customMutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/return_or_add_item_to_collection`,
      method: "post",
      values: {
        resource: resource,
        filters: filters,
      },
      successNotification: (data, values) => {
        // invalidate list
        invalidate({
          resource: resource,
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

  // HANDLE DOWNLOAD
  const handleDownload = async (items: any[]) => {
    let view_items = items.map((row: any) => ({
      ...row.original,
      id: addSeparator(row.original.id, "views"),
      author: identity?.email,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet 1");

    // Check if view_items is not empty and prepare columns
    if (view_items.length > 0) {
      // Extract keys from the first item to use as column headers
      const columns = Object.keys(view_items[0]).map((key) => ({
        header: key,
        key: key,
        width: 20, // You can adjust the width as needed
      }));
      worksheet.columns = columns;
    }

    // Add rows using the transformed items
    view_items.forEach((item) => {
      worksheet.addRow(item);
    });

    // Use ExcelJS to write the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const fileExtension = ".xlsx";

    // Use FileSaver to save the file
    const blob = new Blob([buffer], { type: fileType });
    saveAs(blob, activeViews?.name + fileExtension);
  };

  return (
    <>
      <div className="w-max-screen">
        <div className="flex justify-center">
          <div>{activeViews?.name}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 items-center p-4 gap-4">
          <div className="hidden md:block"></div>{" "}
          {/* Empty div for spacing on medium and large screens */}
          <SelectTaskComponent
            action_options={action_options}
            identity={identity}
            action_step={null}
            record={null}
            data_items={[]}
            data_table={data_table}
            setActionType={setActionType}
            activeActionOption={activeActionOption}
            setActiveActionOption={setActiveActionOption}
          />
          <div className="hidden md:block"></div>{" "}
        </div>

        <MantineProvider
          theme={{
            colorScheme: "light",
            primaryColor: "blue",
          }}
        >
          <MantineReactTable table={data_table} />
        </MantineProvider>
        <Drawer
          opened={opened}
          onClose={close}
          title={activeActionOption?.display_name}
          position="right"
        >
          {activeActionOption?.metadata?.display_component == "Chat" && (
            <Chat
              data_items={data_items}
              setActionType={setActionType}
              action_options={action_options}
              identity={identity}
              open={open}
              close={close}
              opened={opened}
              record={{}} // instead of record when row pass the entire table and i can read the filtered items from there
              data_table={data_table}
              action_step={null}
              variant="default"
              activeActionOption={activeActionOption}
              setActiveActionOption={setActiveActionOption}
            />
          )}
          {activeActionOption?.metadata?.display_component == "Sync" && (
            <Sync
              data_items={data_items}
              setActionType={setActionType}
              action_options={action_options}
              identity={identity}
              open={open}
              close={close}
              opened={opened}
              record={{}}
              data_table={data_table}
              action_step={null}
              variant="default"
              activeActionOption={activeActionOption}
              setActiveActionOption={setActiveActionOption}
            />
          )}
        </Drawer>
      </div>
    </>
  );
}
export default ReactMantineTableView;
