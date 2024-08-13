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
import config from "src/config";
import { useAppStore } from "src/store";

export function SpreadsheetView<T extends Record<string, any>>({
  data_items,
  data_columns,
  tableInstance,
  results,
  isLoadingDataItems,
  resource_group,
}: SpreadsheetViewComponentProps<T>) {
  const { activeQueryGraph } = useAppStore();

  const pixelsPerChar = 10;

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

  let columns_range = findSpreadsheetColumn(data_columns, 2);
  let title_range = findSpreadsheetColumn(data_columns, 1);

  const spreadsheetRef = useRef<SpreadsheetComponent>(null);

  const onCreated = () => {
    let spreadsheet = spreadsheetRef.current;
    if (spreadsheet) {
      spreadsheet?.cellFormat(
        { fontWeight: "bold", textAlign: "left" },
        `${columns_range}`
      );
      spreadsheet?.cellFormat(
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
          spreadsheet?.cellFormat(
            { borderTop: "1px solid #e0e0e0", backgroundColor: "#FFC300" },
            `E${rowStart}:E${rowStart}`
          );
        }
      });
    }
  };

  return (
    <>
      <div className="relative h-full w-full">
        <LoadingOverlay visible={isLoadingDataItems} />

        <SpreadsheetComponent
          key={JSON.stringify(activeQueryGraph)}
          height="100%"
          allowOpen={true}
          openUrl={`${config.API_URL}/api/spreadsheet/open`}
          allowSave={true}
          saveUrl={`${config.API_URL}/api/spreadsheet/save`}
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

              {tableInstance?.getHeaderGroups().map((headerGroup) => (
                <ColumnsDirective>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <ColumnDirective
                        width={150}
                        index={index}
                      ></ColumnDirective>
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
