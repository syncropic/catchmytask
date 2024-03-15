import CodeBlock from "@components/codeblock/codeblock";
import { IIdentity, TabularViewComponentProps } from "@components/interfaces";
import SelectTaskComponent from "@components/selecttask";
import { Button, Flex, MantineProvider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  useCustomMutation,
  useGetIdentity,
  useGo,
  useInvalidate,
  useList,
} from "@refinedev/core";
import { CreateButton } from "@refinedev/mantine";
import { IconDownload } from "@tabler/icons";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  MRT_GlobalFilterTextInput,
  MRT_ToggleFiltersButton,
  MantineReactTable,
  useMantineReactTable,
} from "mantine-react-table";
import { useState } from "react";
import { useAppStore } from "src/store";
import { addSeparator } from "src/utils";

export function TableView<T extends Record<string, any>>({
  data_columns,
  resource,
  session,
  data_items,
  isLoadingDataItems,
  updateTableVisibility,
  customTableConfig,
  item,
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

  const action_options = Array.isArray(actionOptionsData?.data)
    ? actionOptionsData?.data
        .map((option) => ({
          ...option,
          value: option.display_name,
          label: option.display_name,
          metadata: option.metadata,
          name: option.name,
        }))
        .filter((option) => {
          // Ensure we have an array to work with for resources.
          const resources = option.metadata?.resources || [];
          // Check for the presence of 'resource' or 'general' in the resources array.
          return resources.includes(resource) || resources.includes("general");
        })
    : [];

  const go = useGo();
  const [opened, { open, close }] = useDisclosure(false);
  const {
    actionType,
    setActionType,
    activeSession: global_activeSession,
    setActiveSession,
    opened: global_opened,
    setOpened,
    activeSessionStats,
    setActiveSessionStats,
    activeActionOption,
    setActiveActionOption,
  } = useAppStore();
  // if view passed as prop is not null then activeViews is set to view otherwise it is set to global_activeViews
  const activeSession = session ? session : global_activeSession;

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
    // enableColumnOrdering: true,
    // enableGlobalFilter: true,
    // enableColumnFilters: true,
    enableRowActions: true,
    enableStickyHeader: true,
    // enableColumnFilterModes: true,
    // enableFacetedValues: true,
    // enableGrouping: true,
    enablePinning: true,
    // enableEditing: true,
    // editDisplayMode: "cell",
    // enableStickyFooter: true,
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
    // displayColumnDefOptions: {
    //   "mrt-row-actions": { minSize: 250, maxSize: 250, size: 250 },
    // }, //change width of actions column to 300px
    state: { isLoading: mutationIsLoading || isLoadingDataItems },
    // mantineEditTextInputProps: ({ cell }) => ({
    //   onBlur: (event) => {
    //     handleSaveCell(cell, event.target.value);
    //   },
    // }),
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
        view_item={item}
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
            <CreateButton size="xs"></CreateButton>
          </Flex>
          <Flex sx={{ gap: "8px" }}>
            {/* <Button
              onClick={() => {
                setActionType("open_send");
                setOpened(true);
                // open();
              }}
              // disabled
              variant="outline"
              leftIcon={<IconMail />}
              size="xs"
            >
              Send
            </Button> */}
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
              size="xs"
            >
              Download
            </Button>
            {/* <Button
              onClick={() => {
                // setActionType("open_views");
                // open();
                setActionType("set_view");
                setActiveViews(null);
              }}
              // disabled
              variant={activeViews?.name ? "light" : "outline"}
              size="xs"
            >
              {activeViews?.name ? "Clear View" : "No View Selected"}
            </Button> */}
            <Button
              onClick={() => {
                table.setColumnFilters([]);
              }}
              // disabled
              variant={
                table.getState().columnFilters.length > 0 ? "light" : "outline"
              }
              size="xs"
            >
              {table.getState().columnFilters.length > 0
                ? `Clear ${table.getState().columnFilters.length} Filters`
                : "No Filters Applied"}
              {/* {JSON.stringify(table.getState().columnFilters)} */}
            </Button>
            {/* <Button
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
              size="xs"
            >
              Sync
            </Button> */}
            {/* <Button
              onClick={() => {
                setActionType("chat");
                const item = action_options.find(
                  (item) => item.name === "chat"
                );
                console.log("item", item);
                setActiveActionOption(item);
                open();
              }}
              // disabled
              variant="outline"
              size="xs"
            >
              Chat
            </Button> */}
            {/* <Button
              color="red"
              disabled={!table.getIsSomeRowsSelected()}
              // onClick={handleDelete}
              //   onClick={handleComingSoon}
              variant="filled"
              size="xs"
            >
              Delete
            </Button> */}
          </Flex>
        </Flex>
      );
    },
    renderDetailPanel: ({ row }) => (
      <div>
        <CodeBlock jsonData={row.original} />
      </div>
    ),
    ...customTableConfig,
  });

  // const applyFilters = (activeView: ActiveView, data: any[]): any[] => {
  //   let filteredData = [...data];

  //   activeView.filters_configuration.forEach((group) => {
  //     if (group.group_operator === "OR") {
  //       // For 'OR' logic, ensure at least one condition within the group matches
  //       filteredData = filteredData.filter((item) =>
  //         group.conditions.some((condition) => {
  //           return evaluateCondition(item, condition);
  //         })
  //       );
  //     } else {
  //       // Default to 'AND' logic if no group_operator is specified
  //       group.conditions.forEach((condition) => {
  //         filteredData = filteredData.filter((item) => {
  //           return evaluateCondition(item, condition);
  //         });
  //       });
  //     }
  //   });

  //   return filteredData;
  // };

  // When activeViews changes, apply filters
  // useEffect(() => {
  //   // Reset filtered data and column visibility when activeViews is null
  //   if (activeSession === null) {
  //     setFilteredDataItems(data_items);
  //     updateTableVisibility(data_table, null); // Reset column visibility to default
  //   } else {
  //     // Existing logic for when activeViews is not null
  //     const newFilteredData = activeSession?.filters_configuration
  //       ? applyFilters(activeSession, data_items)
  //       : data_items;
  //     setFilteredDataItems(newFilteredData);
  //     updateTableVisibility(data_table, activeSession?.fields_configuration);

  //     let activeViewStats = {
  //       totalItems: filteredDataItems.length,
  //     };
  //   }
  // }, [activeSession, data_items]);

  // useEffect(() => {
  //   const columnFilters = data_table.getState().columnFilters;
  //   const filtered_items = data_table.getFilteredRowModel().flatRows;
  //   if (columnFilters.length > 0 && filtered_items.length === 0) {
  //     console.log("Column filters array has items.", columnFilters);
  //     console.log("Filtered items array has 0 items.");
  //     handleAddToCollection(resource, columnFilters);
  //   }
  // }, [data_table.getState().columnFilters]); // Dependency array

  // const handleSaveCell = (cell: any, event: any) => {
  //   let update_values = {
  //     id: cell.row.original.related_record,
  //     [cell.column.id]: event,
  //   };
  //   // console.log("update_values", update_values);
  //   let id = cell.row.original.related_record;
  //   customMutate({
  //     url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/${resource}/${id}`,
  //     method: "post",
  //     values: update_values,
  //     successNotification: (data, values) => {
  //       // invalidate list
  //       invalidate({
  //         resource: resource,
  //         invalidates: ["list"],
  //       });

  //       return {
  //         message: `successfully executed.`,
  //         description: "Success with no errors",
  //         type: "success",
  //       };
  //     },
  //     errorNotification: (data, values) => {
  //       return {
  //         message: `Something went wrong when executing`,
  //         description: "Error",
  //         type: "error",
  //       };
  //     },
  //   });
  // };

  // const handleAddToCollection = (resource: any, filters: any) => {
  //   // let update_values = {
  //   //   id: cell.row.original.related_record,
  //   //   [cell.column.id]: event,
  //   // };
  //   // // console.log("update_values", update_values);
  //   // let id = cell.row.original.related_record;
  //   customMutate({
  //     url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/return_or_add_item_to_collection`,
  //     method: "post",
  //     values: {
  //       resource: resource,
  //       filters: filters,
  //     },
  //     successNotification: (data, values) => {
  //       // invalidate list
  //       invalidate({
  //         resource: resource,
  //         invalidates: ["list"],
  //       });

  //       return {
  //         message: `successfully executed.`,
  //         description: "Success with no errors",
  //         type: "success",
  //       };
  //     },
  //     errorNotification: (data, values) => {
  //       return {
  //         message: `Something went wrong when executing`,
  //         description: "Error",
  //         type: "error",
  //       };
  //     },
  //   });
  // };

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
    saveAs(blob, activeSession?.name + fileExtension);
  };

  return (
    <div className="flex flex-col gap-4">
      {item?.display_components?.includes("ListHeader") && (
        <div className="flex justify-center">
          <div>{item?.resource}</div>
        </div>
      )}

      {item?.display_components?.includes("ListActions") && (
        <div className="flex flex-row justify-center">
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
            view_item={item}
          />
        </div>
      )}

      {item?.display_components?.includes("TableList") && (
        <MantineProvider
          theme={{
            colorScheme: "light",
            primaryColor: "blue",
          }}
        >
          <MantineReactTable table={data_table} />
        </MantineProvider>
      )}
    </div>
  );
}
export default TableView;
