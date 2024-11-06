"use client";
import MonacoEditor from "@components/MonacoEditor";
import NaturalLanguageEditor from "@components/NaturalLanguageEditor";
import {
  createFieldsDocumentation,
  createFieldsDocumentationHTML,
  useReadRecordByState,
  useTableColumns,
} from "@components/Utils";
import {
  DocumentationComponentProps,
  ResultsComponentProps,
} from "@components/interfaces";
import * as React from "react";
import { useAppStore } from "src/store";

export interface RowData {
  [key: string]: any;
}
const PAGE_SIZES = [10, 15, 20];

export function Documentation<T extends Record<string, any>>({
  // display_mode,
  // data_items,
  // data_fields,
  // record,
  // isLoadingDataItems,
  // entity_type,
  // ui,
  // action = "set_fields",
  // display,
  view_mode,
  record,
}: DocumentationComponentProps<T>) {
  // const { ref, width } = useElementSize();
  // const [isLarge, setIsLarge] = useState(true);

  // const { activeView } = useAppStore();

  // let read_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: activeView?.id,
  //   record: activeView,
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: viewData,
  //   isLoading: viewIsLoading,
  //   error: viewError,
  // } = useReadRecordByState(read_record_state);

  // let viewRecord = viewData?.data?.find(
  //   (item: any) => item?.message?.code === activeView?.id
  // )?.data[0];

  // let selected_record_items_key = `${action}_action_input_${record?.id}`;
  // const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  // let action_input_form_values_key = `${action}_${actionInputId}`;
  // return board for action steps by default
  // if (view_mode === "board") {
  //   return <Board data_fields={data_items}></Board>;
  // }
  // if (view_mode === "json") {
  //   return (
  //     <MonacoEditor
  //       value={{
  //         viewRecord: viewRecord,
  //       }}
  //       language="json"
  //       height="75vh"
  //     />
  //   );
  // }
  // if (view_mode === "table") {
  //   return (
  //     // <MonacoEditor
  //     //   value={{
  //     //     data_items: data_items,
  //     //   }}
  //     //   language="json"
  //     //   height="75vh"
  //     // />
  //     <TableView data_items={data_items} data_fields={data_fields}></TableView>
  //     // <div>table</div>
  //   );
  // }
  // if (view_mode === "datagrid") {
  //   return (
  //     <>
  //       <DataGridView
  //         data_fields={
  //           sortedRecords[`${action_input_form_values_key}`]
  //             ? sortedRecords[`${action_input_form_values_key}`].filter(
  //                 (sortedRecord: any) =>
  //                   selectedRecords[`${action_input_form_values_key}`]?.some(
  //                     (selectedRecord: any) =>
  //                       selectedRecord.name === sortedRecord.name
  //                   )
  //               )
  //             : selectedRecords[`${action_input_form_values_key}`] ||
  //               data_fields
  //         }
  //         // tableInstance={table}
  //         // resource_group={
  //         //   record?.success_message_code || record?.entity_type || entity_type
  //         // }
  //         data_items={data_items}
  //         // setSorting={setSorting}
  //         // sorting={sorting}
  //         view_record={viewRecord}
  //         // ui={ui || {}}
  //       />
  //     </>
  //   );
  // }
  // default return table view
  return (
    <>
      {/* <MonacoEditor
        value={{
          data_items: data_items,
          data_fieds: sortedRecords[`${action_input_form_values_key}`]
            ? sortedRecords[`${action_input_form_values_key}`].filter(
                (sortedRecord: any) =>
                  selectedRecords[`${action_input_form_values_key}`]?.some(
                    (selectedRecord: any) =>
                      selectedRecord.name === sortedRecord.name
                  )
              )
            : selectedRecords[`${action_input_form_values_key}`] || data_fields,
          records: table.getSortedRowModel().rows.map((row) => row.original),
        }}
        language="json"
        height="75vh"
      /> */}
      {/* <MonacoEditor
        value={{
          viewRecord: createFieldsDocumentation(viewRecord?.fields, {
            name: viewRecord?.name,
            description: viewRecord?.description,
          }),
        }}
        language="json"
        height="75vh"
      /> */}
      <div className="h-96 relative border border-gray-300 rounded-md overflow-hidden">
        <NaturalLanguageEditor
          value={createFieldsDocumentationHTML(record?.fields, {
            name: record?.name,
            description: record?.description,
          })}
        />
      </div>
    </>
  );
}

export default Documentation;
