import SelectAction from "@components/SelectAction";
import CodeBlock from "@components/codeblock/codeblock";
import { IIdentity, TabularViewComponentProps } from "@components/interfaces";
import { Button, Flex, MantineProvider } from "@mantine/core";
import { useGetIdentity } from "@refinedev/core";
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
import { useEffect } from "react";
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
  const { data: identity } = useGetIdentity<IIdentity>();
  // console.log("data_columns", data_columns);

  const {
    activeSession: global_activeSession,
    setActiveSession,
    opened: global_opened,
  } = useAppStore();
  // if view passed as prop is not null then activeViews is set to view otherwise it is set to global_activeViews
  const activeSession = session ? session : global_activeSession;
  // console.log("customTableConfig", customTableConfig);

  // useMantineReactTable hook
  const data_table = useMantineReactTable<T>({
    columns: data_columns,
    data: data_items,
    enableRowSelection: true,
    enableColumnOrdering: true,
    enableGlobalFilter: true,
    enableColumnFilters: true,
    enableRowActions: true,
    enableStickyHeader: true,
    // enableColumnFilterModes: true,
    enableFacetedValues: true,
    enableGrouping: true,
    enablePinning: true,
    // enableEditing: true,
    // editDisplayMode: "cell",
    enableStickyFooter: true,
    enableColumnResizing: true,
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
      "mrt-row-actions": { minSize: 200, maxSize: 200 },
    },
    state: { isLoading: isLoadingDataItems },
    // mantineEditTextInputProps: ({ cell }) => ({
    //   onBlur: (event) => {
    //     handleSaveCell(cell, event.target.value);
    //   },
    // }),
    paginationDisplayMode: "pages",
    // positionToolbarAlertBanner: "bottom",
    // mantinePaginationProps: {
    //   radius: "xl",
    //   size: "lg",
    // },
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
      // <SelectTaskComponent
      //   action_options={action_options}
      //   identity={identity}
      //   action_step={null}
      //   record={row.original}
      //   data_table={data_table}
      //   data_items={[]}
      //   setActionType={setActionType}
      //   variant="inline"
      //   view_item={item}
      // />
      <SelectAction
        actions_list={item?.actions ? item?.actions : []}
        record={row.original}
        view_item={item}
      />
    ),
    renderTopToolbar: ({ table }) => {
      // const handleDelete = () => {
      //   table.getSelectedRowModel().flatRows.map((row) => {
      //     console.log("deleting " + row.getValue("pnr"));
      //   });
      // };

      return (
        <Flex p="md" justify="space-between">
          <Flex gap="xs">
            <MRT_GlobalFilterTextInput table={table} />
            <MRT_ToggleFiltersButton table={table} />
            <CreateButton size="xs"></CreateButton>
          </Flex>
          <Flex sx={{ gap: "8px" }}>
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

  useEffect(() => {
    const columnFilters = data_table.getState().columnFilters;
    const filtered_items = data_table.getFilteredRowModel().flatRows;
    if (columnFilters.length > 0 && filtered_items.length === 0) {
      console.log("Column filters array has items.", columnFilters);
      // console.log("Filtered items array has 0 items.");
      // handleAddToCollection(resource, columnFilters);
    }
  }, [data_table.getState().columnFilters]); // Dependency array

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
          {/* <SelectTaskComponent
            action_step={null}
            record={null}
            data_items={[]}
            data_table={data_table}
          /> */}
          <SelectAction
            actions_list={item?.actions ? item?.actions : []}
            // record={activeSession} get the row model for selected items
            record={activeSession}
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
