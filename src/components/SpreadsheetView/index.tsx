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
  RowsDirective,
  RowDirective,
  CellsDirective,
  CellDirective,
} from "@syncfusion/ej2-react-spreadsheet";
import {
  RangeDirective,
  ColumnsDirective,
  ColumnDirective,
} from "@syncfusion/ej2-react-spreadsheet";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "src/store";

export function SpreadsheetView<T extends Record<string, any>>({
  data_items,
  data_columns,
  tableInstance,
  results,
  isLoadingDataItems,
  resource_group,
}: SpreadsheetViewComponentProps<T>) {
  // // data_columns
  // console.log("spreadsheet data_columns", data_columns);
  // // results
  // console.log("spreadsheet results", results);

  const { activeQueryGraph } = useAppStore();

  // Define pixels per character (adjust as needed)
  const pixelsPerChar = 10; // Example value

  // Function to calculate width based on the number of characters
  // const calculateWidth = (header) => {
  //   const charCount = header.column.columnDef.header.length;
  //   return charCount * pixelsPerChar;
  // };
  // find the corresponding spreadsheet column range is A1:E1 given the number of data columns array
  const findSpreadsheetColumn = (
    data_columns: any[],
    row_number: number
  ): string => {
    const getColumnLetter = (colIndex: number): string => {
      let column = "";
      let temp = colIndex;

      while (temp > 0) {
        let modulo = (temp - 1) % 26;
        column = String.fromCharCode(65 + modulo) + column;
        temp = Math.floor((temp - modulo) / 26);
      }

      return column;
    };

    const columnCount = data_columns.length;
    const startColumn = `A${row_number}`;
    const endColumn = getColumnLetter(columnCount) + row_number;

    return `${startColumn}:${endColumn}`;
  };
  let columns_range = findSpreadsheetColumn(data_columns, 2); // this has display columns too fix later
  let title_range = findSpreadsheetColumn(data_columns, 1);
  // get all visible columns from the tanstack table instance
  // const visibleTableColumns = tableInstance?.getVisibleFlatColumns();
  // console.log("visibleFlatColumns", visibleTableColumns);

  // {tableInstance.getHeaderGroups().map((headerGroup) => (
  //   <tr key={headerGroup.id} className="flex">
  //     {headerGroup.headers.map((header) => {
  //       return (
  //         <th
  //           key={header.id}
  //           className="[&:has([role=checkbox])]:pr-0"
  //           style={{ width: `${calculateWidth(header)}px` }}
  //         >
  //           {header.isPlaceholder
  //             ? null
  //             : flexRender(
  //                 header.column.columnDef.header,
  //                 header.getContext()
  //               )}
  //           {/* {header.column.columnDef.header} */}
  //         </th>
  //       );
  //     })}
  //   </tr>
  // ))}
  // console.log("columns_range", columns_range);
  const spreadsheetRef = useRef(null);
  // to get the formatting. 1) get the index of all the columns the table. get the index of interested cells. loop and apply formatting
  // loop through the data and crete cell format for each record

  const onCreated = () => {
    let spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      spreadsheet.cellFormat(
        { fontWeight: "bold", textAlign: "left" },
        `${columns_range}`
      );
      spreadsheet.cellFormat(
        {
          fontWeight: "bold",
          textAlign: "left",
          verticalAlign: "middle",
          fontSize: "13pt",
          backgroundColor: "#1E88E5",
        },
        `${title_range}`
      );
      data_items.forEach((item, index) => {
        let rowStart = index + 3;
        if (item["payment_type"] === "Prepaid") {
          spreadsheet.cellFormat(
            { borderTop: "1px solid #e0e0e0", backgroundColor: "#FFC300" },
            `E${rowStart}:E${rowStart}`
          );
        }
      });

      // spreadsheet.numberFormat("$#,##0.00", "G3:G5");
      // // format date columns
      // spreadsheet.numberFormat("m/d/yyyy", "A3:A5");
      // // format as text
      // spreadsheet.numberFormat("@", "D3:D5");
      // // set background color conditional formatting
      // spreadsheet.conditionalFormat({
      //   type: "Expression",
      //   format: { backgroundColor: "#009999" },
      //   value: "value = Prepaid",
      //   range: "E2:E100",
      // });
      // spreadsheet.cellFormat(
      //   { borderTop: "1px solid #e0e0e0", backgroundColor: "#FFC300" },
      //   "E3:E100"
      // );

      // spreadsheet.conditionalFormat({
      //   type: "ContainsText",
      //   value: "Prepaid",
      //   format: {
      //     style: {
      //       color: "#ffffff",
      //       backgroundColor: "#009999",
      //       fontWeight: "bold",
      //     },
      //   },
      //   range: "E3:E100",
      // });
      // // deleting the rows from 8th to 10th index. To delete row, the third argument of enum type is passed as 'Row', the last argument specifies the sheet name or index in which the delete operation will perform. By default,active sheet will be considered. It is applicable only for model type Row and Column.
      // spreadsheet.delete(8, 10, "Row", 0); // startIndex, endIndex, Row, sheet index
      // // deleting the 2nd and 5th indexed columns
      // spreadsheet.delete(2, 2, "Column", "Sheet2");
      // spreadsheet.delete(5, 5, "Column");
      // spreadsheet.delete(0, 0, "Sheet"); // delete the first sheet. sheet index starts from 0
      // // Applies style formatting after deleted the rows and columns
      // spreadsheet.cellFormat({ textAlign: "center" }, "A2:A8");
      // spreadsheet.cellFormat({ textAlign: "center" }, "D2:G8");
    }
  };

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
          showRibbon={false}
          showFormulaBar={false}
          allowCellFormatting={true}
          allowNumberFormatting={true}
          allowConditionalFormat={true}
          allowDelete={true}
          ref={spreadsheetRef}
          created={onCreated}
        >
          <SheetsDirective>
            <SheetDirective name={resource_group}>
              <RowsDirective>
                <RowDirective height={30}>
                  <CellsDirective>
                    <CellDirective
                      value={resource_group}
                      colSpan={data_columns.length}
                    ></CellDirective>
                  </CellsDirective>
                </RowDirective>
              </RowsDirective>
              <RangesDirective>
                <RangeDirective
                  dataSource={data_items}
                  startCell="A2"
                ></RangeDirective>
              </RangesDirective>

              {tableInstance.getHeaderGroups().map((headerGroup) => (
                <ColumnsDirective>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <ColumnDirective
                        // width={calculateWidth(header)}
                        width={150}
                        index={index}
                        // field={column.field}
                        // headerText={column.headerText}
                      >
                        {/* {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )} */}
                        {/* {header.column.columnDef.header} */}
                      </ColumnDirective>
                    );
                  })}
                </ColumnsDirective>
              ))}
            </SheetDirective>
          </SheetsDirective>
        </SpreadsheetComponent>
      </div>
    </>
  );
}
export default SpreadsheetView;
