// import Analytics, { CategoricalAnalytics } from "@components/Analytics";
// import MessageDetail from "@components/MessageDetail";
// import MonacoEditor from "@components/MonacoEditor";
// import SelectAction from "@components/SelectAction";
// import CodeBlock from "@components/codeblock/codeblock";
import {
  IIdentity,
  SpreadsheetViewComponentProps,
} from "@components/interfaces";
import { Box, LoadingOverlay } from "@mantine/core";
import { DataManager, Query } from "@syncfusion/ej2-data";
import {
  SpreadsheetComponent,
  SheetsDirective,
  SheetDirective,
  RangesDirective,
  Sheet,
} from "@syncfusion/ej2-react-spreadsheet";
import {
  RangeDirective,
  ColumnsDirective,
  ColumnDirective,
} from "@syncfusion/ej2-react-spreadsheet";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
// import { Button, Flex, MantineProvider, Text } from "@mantine/core";
// import { useGetIdentity } from "@refinedev/core";
// import { CreateButton } from "@refinedev/mantine";
// import { IconDownload } from "@tabler/icons";
// import ExcelJS from "exceljs";
// import { saveAs } from "file-saver";
// import {
//   MRT_GlobalFilterTextInput,
//   MRT_ToggleFiltersButton,
//   MantineReactTable,
//   useMantineReactTable,
// } from "mantine-react-table";
// import { useEffect } from "react";
// import { useAppStore } from "src/store";
// import { addSeparator } from "src/utils";

export function SpreadsheetView<T extends Record<string, any>>({
  data_items,
  isLoadingDataItems,
}: SpreadsheetViewComponentProps<T>) {
  // const { data: identity } = useGetIdentity<IIdentity>();
  // console.log("data_columns", data_columns);

  const { activeQueryGraph } = useAppStore();
  // // if view passed as prop is not null then activeViews is set to view otherwise it is set to global_activeViews
  // const activeSession = session ? session : global_activeSession;
  // // console.log("customTableConfig", customTableConfig);

  // interface IClickActionItem {
  //   action_id: string;
  //   action_view_id: string;
  // }
  // const handleClickAction = (selectedActionItem: IClickActionItem) => {
  //   // if (record) {
  //   //   setActiveRecord(record);
  //   // }
  //   // if (selectedActionItem) {
  //   //   setActiveActionId(selectedActionItem);
  //   // }
  //   // // such as the active view item, based on the specific user interaction.
  //   // if (view_item) {
  //   //   setActiveViewItem(view_item);
  //   // }
  //   // if (selectedActionItem) {
  //   //   activateSection("rightSection");
  //   // }
  // };
  // // const handleActionChange = (value: string[]) => {
  // //   // console.log("value", value[0]);
  // //   setFieldValue("action", value);
  // //   if (value[0]) {
  // //     // setSelectedActionId(value[0]);
  // //     setActiveActionId({ id: value[0] });
  // //   }
  // // };

  // //handle toggleDisplay
  // const activateSection = (section: string) => {
  //   if (activeLayout) {
  //     const newLayout = { ...activeLayout };
  //     newLayout[section].isDisplayed = true;
  //     setActiveLayout(newLayout);
  //   }
  // };

  // // useMantineReactTable hook
  // const data_table = useMantineReactTable<T>({
  //   columns: data_columns,
  //   data: data_items,
  //   // layoutMode: "grid",
  //   // mantineTableHeadCellProps: {
  //   //   sx: {
  //   //     flex: "0 0 auto",
  //   //   },
  //   // },
  //   // mantineTableBodyCellProps: {
  //   //   sx: {
  //   //     flex: "0 0 auto",
  //   //   },
  //   // },
  //   displayColumnDefOptions: {
  //     "mrt-row-actions": { minSize: 200, maxSize: 200 },
  //     "mrt-row-select": {
  //       // enableColumnActions: true,
  //       // enableHiding: true,
  //       size: 50,
  //     },
  //     "mrt-row-expand": {
  //       // enableColumnActions: true,
  //       // enableHiding: true,
  //       size: 50,
  //     },
  //   },
  //   state: { isLoading: isLoadingDataItems },
  //   // mantineEditTextInputProps: ({ cell }) => ({
  //   //   onBlur: (event) => {
  //   //     handleSaveCell(cell, event.target.value);
  //   //   },
  //   // }),
  //   paginationDisplayMode: "pages",
  //   // positionToolbarAlertBanner: "bottom",
  //   // mantinePaginationProps: {
  //   //   radius: "xl",
  //   //   size: "lg",
  //   // },
  //   mantineSearchTextInputProps: {
  //     placeholder: "Search Items",
  //   },
  //   mantineTableContainerProps: { sx: { maxHeight: "500px" } },
  //   // mantineTableProps: {
  //   //   sx: {
  //   //     tableLayout: "fixed",
  //   //   },
  //   // },

  //   renderRowActions: ({ row }) => (
  //     // <SelectTaskComponent
  //     //   action_options={action_options}
  //     //   identity={identity}
  //     //   action_step={null}
  //     //   record={row.original}
  //     //   data_table={data_table}
  //     //   data_items={[]}
  //     //   setActionType={setActionType}
  //     //   variant="inline"
  //     //   view_item={item}
  //     // />
  //     <SelectAction
  //       actions_list={actions_list ? actions_list : []}
  //       record={row.original}
  //       view_item={item}
  //     />
  //   ),
  //   renderTopToolbar: ({ table }) => {
  //     // const handleDelete = () => {
  //     //   table.getSelectedRowModel().flatRows.map((row) => {
  //     //     console.log("deleting " + row.getValue("pnr"));
  //     //   });
  //     // };

  //     return (
  //       <Flex p="md" justify="space-between">
  //         <Flex gap="xs">
  //           <MRT_GlobalFilterTextInput table={table} />
  //           <MRT_ToggleFiltersButton table={table} />
  //           {/* <CreateButton size="xs"></CreateButton> */}
  //           <Button
  //             size="xs"
  //             onClick={() =>
  //               handleClickAction({
  //                 action_id: "actions:⟨018ea244-1082-749d-80a9-d9b080b74005⟩",
  //                 action_view_id: item?.view[0]?.create.view_id,
  //               })
  //             }
  //           >
  //             Create
  //           </Button>
  //         </Flex>
  //         <Flex sx={{ gap: "8px" }}>
  //           <Button
  //             onClick={() => {
  //               // setActionType("open_download");
  //               // setOpened(true);
  //               // open();
  //               handleDownload(table.getFilteredRowModel().flatRows);
  //             }}
  //             // disabled
  //             variant="outline"
  //             leftIcon={<IconDownload />}
  //             size="xs"
  //           >
  //             Download
  //           </Button>
  //           {/* <Button
  //             onClick={() => {
  //               // setActionType("open_views");
  //               // open();
  //               setActionType("set_view");
  //               setActiveViews(null);
  //             }}
  //             // disabled
  //             variant={activeViews?.name ? "light" : "outline"}
  //             size="xs"
  //           >
  //             {activeViews?.name ? "Clear View" : "No View Selected"}
  //           </Button> */}
  //           <Button
  //             onClick={() => {
  //               table.setColumnFilters([]);
  //             }}
  //             // disabled
  //             variant={
  //               table.getState().columnFilters.length > 0 ? "light" : "outline"
  //             }
  //             size="xs"
  //           >
  //             {table.getState().columnFilters.length > 0
  //               ? `Clear ${table.getState().columnFilters.length} Filters`
  //               : "No Filters Applied"}
  //             {/* {JSON.stringify(table.getState().columnFilters)} */}
  //           </Button>
  //         </Flex>
  //       </Flex>
  //     );
  //   },
  //   ...(customTableConfig?.enableExpandableRows !== false
  //     ? {
  //         renderDetailPanel: ({ row }) => (
  //           <div>
  //             {/* Code block or any other component can go here. */}

  //             {/* <MessageDetail value={row.original} /> */}
  //             {item?.detail_panel_configuration?.display_component ||
  //             item?.view?.[0]?.detail_panel_configuration?.display_component ==
  //               "MessageDetail" ? (
  //               <MessageDetail value={row.original} />
  //             ) : (
  //               <MonacoEditor value={row.original} />
  //             )}
  //           </div>
  //         ),
  //       }
  //     : {}),
  //   ...customTableConfig,
  // });

  // // useEffect(() => {
  // //   const columnFilters = data_table.getState().columnFilters;
  // //   const filtered_items = data_table.getFilteredRowModel().flatRows;
  // //   if (columnFilters.length > 0 && filtered_items.length === 0) {
  // //     console.log("Column filters array has items.", columnFilters);
  // //     // console.log("Filtered items array has 0 items.");
  // //     // handleAddToCollection(resource, columnFilters);
  // //   }
  // // }, [data_table.getState().columnFilters]); // Dependency array

  // // get access to the row selection model
  // useEffect(() => {
  //   //fetch data based on row selection state or something
  //   // console.log("rowSelection", data_table.getState().rowSelection);
  //   // rowmodel.flatRows
  //   const selectedRows = data_table
  //     .getSelectedRowModel()
  //     .flatRows.map((item) => item.original); //or read entire rows
  //   // console.log("item", item);
  //   setSelectedItems({
  //     [item.id]: selectedRows,
  //   });
  // }, [data_table.getState().rowSelection]);

  // // calculate analytics
  // // get access to the row selection model
  // // useEffect(() => {
  // //   //fetch data based on row selection state or something
  // //   // console.log("rowSelection", data_table.getState().rowSelection);
  // //   // rowmodel.flatRows
  // //   // const selectedRows = data_table.getSelectedRowModel().flatRows; //or read entire rows
  // //   // console.log("selectedRows", selectedRows);
  // //   // setSelectedItems(selectedRows);
  // //   const data_table_filtered_items = data_table.getFilteredRowModel().flatRows;
  // //   console.log("data_table_filtered_items", data_table_filtered_items);
  // //   let analytics = {
  // //     total_items: data_items.length,
  // //     total_filtered_items: data_table_filtered_items.length,
  // //     selected_items: data_table.getState().rowSelection.length,
  // //   };
  // //   setAnalytics(analytics);
  // // }, [
  // //   data_table.getState().rowSelection,
  // //   data_table.getFilteredRowModel().flatRows,
  // // ]);

  // // HANDLE DOWNLOAD
  // const handleDownload = async (items: any[]) => {
  //   let view_items = items.map((row: any) => ({
  //     ...row.original,
  //     id: addSeparator(row.original.id, "views"),
  //     author: identity?.email,
  //   }));

  //   const workbook = new ExcelJS.Workbook();
  //   const worksheet = workbook.addWorksheet("Sheet 1");

  //   // Check if view_items is not empty and prepare columns
  //   if (view_items.length > 0) {
  //     // Extract keys from the first item to use as column headers
  //     const columns = Object.keys(view_items[0]).map((key) => ({
  //       header: key,
  //       key: key,
  //       width: 20, // You can adjust the width as needed
  //     }));
  //     worksheet.columns = columns;
  //   }

  //   // Add rows using the transformed items
  //   view_items.forEach((item) => {
  //     worksheet.addRow(item);
  //   });

  //   // Use ExcelJS to write the workbook
  //   const buffer = await workbook.xlsx.writeBuffer();
  //   const fileType =
  //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  //   const fileExtension = ".xlsx";

  //   // Use FileSaver to save the file
  //   const blob = new Blob([buffer], { type: fileType });
  //   saveAs(blob, activeSession?.name + fileExtension);
  // };

  // const display_components =
  //   item?.display_components || item?.view?.[0].display_components;

  // const actions_list = item?.actions || item?.view?.[0]?.actions || [];
  /**
   * Default data source
   */

  // const [spreadsheetKey, setSpreadsheetKey] = useState(0);

  // // Update key when data_items changes
  // useEffect(() => {
  //   setSpreadsheetKey((prevKey) => prevKey + 1);
  // }, [data_items]);

  return (
    <>
      {/* <div>{JSON.stringify(data_items)}</div> */}
      <div className="relative h-full w-full">
        <LoadingOverlay visible={isLoadingDataItems} />

        <SpreadsheetComponent
          key={JSON.stringify(activeQueryGraph)} // Add key to force re-render
          height="100%"
          allowOpen={true}
          openUrl={`${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/api/spreadsheet/open`}
          allowSave={true}
          saveUrl={`${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/api/spreadsheet/save`}
        >
          <SheetsDirective>
            <SheetDirective>
              <RangesDirective>
                <RangeDirective dataSource={data_items}></RangeDirective>
              </RangesDirective>
            </SheetDirective>
          </SheetsDirective>
        </SpreadsheetComponent>
      </div>
    </>
  );
}
export default SpreadsheetView;
