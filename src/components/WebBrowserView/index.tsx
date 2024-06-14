// import Analytics, { CategoricalAnalytics } from "@components/Analytics";
// import MessageDetail from "@components/MessageDetail";
// import MonacoEditor from "@components/MonacoEditor";
// import SelectAction from "@components/SelectAction";
// import CodeBlock from "@components/codeblock/codeblock";
import { WebBrowserViewComponentProps } from "@components/interfaces";
import { useState } from "react";
// import { Box, LoadingOverlay } from "@mantine/core";
// import { DataManager, Query } from "@syncfusion/ej2-data";
// import {
//   SpreadsheetComponent,
//   SheetsDirective,
//   SheetDirective,
//   RangesDirective,
//   Sheet,
// } from "@syncfusion/ej2-react-spreadsheet";
// import {
//   RangeDirective,
//   ColumnsDirective,
//   ColumnDirective,
// } from "@syncfusion/ej2-react-spreadsheet";
// import { useEffect, useState } from "react";
// import { useAppStore } from "src/store";
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

export function WebBrowserView<T extends Record<string, any>>({
  url,
}: WebBrowserViewComponentProps<T>) {
  // const { data: identity } = useGetIdentity<IIdentity>();
  // console.log("data_columns", data_columns);

  // const { activeQueryGraph } = useAppStore();
  // const [url, setUrl] = useState(initialUrl);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // setUrl(e.target.value);
  // };

  // const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === "Enter") {
  //     // setUrl(e.currentTarget.value);
  //   }
  // };
  // const [url, setUrl] = useState(initialUrl);
  // const [inputUrl, setInputUrl] = useState(initialUrl);

  // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputUrl(e.target.value);
  // };

  // const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  //   if (e.key === 'Enter') {
  //     setUrl(`/proxy?url=${encodeURIComponent(inputUrl)}`);
  //   }
  // };

  return (
    <>
      {/* <div>{JSON.stringify(data_items)}</div> */}
      <div className="relative h-full w-full">
        {/* <LoadingOverlay visible={isLoadingDataItems} /> */}

        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <iframe
            src={url}
            style={{ flex: 1, border: "none" }}
            title="Web Browser"
          />
        </div>
      </div>
    </>
  );
}
export default WebBrowserView;
