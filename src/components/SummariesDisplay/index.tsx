"use client";
import MonacoEditor from "@components/MonacoEditor";
import {
  DebouncedInput,
  isAllLocalDBSuccess,
  mergeEdgeWithEntityValues,
  processPaymentReconciliationData,
  processReconciliationData,
  useFetchQueryDataByState,
  useReadRecordByState,
  useTableColumns,
} from "@components/Utils";
import {
  SummariesDisplayComponentProps,
  ResultsComponentProps,
} from "@components/interfaces";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { useElementSize } from "@mantine/hooks";
import { useAppStore } from "src/store";
import Board from "@components/Board";
import SummaryMetrics from "./SummaryMetrics";
import MatrixTable, { PaymentStatusMatrixTable } from "./MatrixTable";
import SupplierStackChart from "./SupplierStackChart";
import PaymentMatrixTable from "./PaymentMatrixTable";
import UnifiedSummaryMetrics from "./SummaryMetrics";
import PaymentComparisonChart from "./PaymentComparisonChart";
import PaymentStatusChart from "./PaymentStatusChart";

export function SummariesDisplay<T extends Record<string, any>>({
  display_mode,
  data_items,
  data_fields,
  record,
  isLoadingDataItems,
  entity_type,
  ui,
  action = "set_fields",
  display,
  view_mode,
}: SummariesDisplayComponentProps<T>) {
  // const { ref, width } = useElementSize();
  // const [isLarge, setIsLarge] = useState(true);

  const { activeView } = useAppStore();

  let read_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: activeView?.id,
    record: activeView,
    read_record_mode: "remote",
  };

  const {
    data: viewData,
    isLoading: viewIsLoading,
    error: viewError,
  } = useReadRecordByState(read_record_state);

  let viewRecord = viewData?.data?.find(
    (item: any) => item?.message?.code === activeView?.id
  )?.data[0];

  const { tableColumns } = useTableColumns({
    field_configurations: data_fields?.map((nested_field: any) =>
      mergeEdgeWithEntityValues(nested_field)
    ),
    table_id: record?.id,
  });
  const view_modes_action_input_form_values_key = `view_modes_${activeView?.id}`;

  const view_modes_action_input_form_values = useAppStore(
    (state) =>
      state.action_input_form_values[view_modes_action_input_form_values_key]
  );
  // let selected_record_items_key = `${action}_action_input_${record?.id}`;
  const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  let action_input_form_values_key = `${action}_${actionInputId}`;
  // return board for action steps by default
  // if (view_mode === "board") {
  //   return <Board data_fields={data_items}></Board>;
  // }
  // if (view_mode === "json") {
  //   return (
  //     <MonacoEditor
  //       value={{
  //         data_items: data_items,
  //       }}
  //       language="json"
  //       height="75vh"
  //     />
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
  // // default return table view
  // let data_summaries = processPaymentReconciliationData(data_items);
  if (activeView?.action_models?.search == "supplier analysis") {
    let data_summaries = processReconciliationData(data_items);
    return (
      <>
        {/* <MonacoEditor
          value={{
            // data_items: data_items,
            // data_matrix: processReconciliationData(data_items),
            // view_modes_action_input_form_values_summaries:
            //   view_modes_action_input_form_values?.summaries,
            data_summaries: data_summaries,
            // data_fieds: sortedRecords[`${action_input_form_values_key}`]
            //   ? sortedRecords[`${action_input_form_values_key}`].filter(
            //       (sortedRecord: any) =>
            //         selectedRecords[`${action_input_form_values_key}`]?.some(
            //           (selectedRecord: any) =>
            //             selectedRecord.name === sortedRecord.name
            //         )
            //     )
            //   : selectedRecords[`${action_input_form_values_key}`] || data_fields,
            // records: table.getSortedRowModel().rows.map((row) => row.original),
          }}
          language="json"
          height="25vh"
        /> */}
        <div className="pb-4">
          {view_modes_action_input_form_values?.summaries?.includes(
            "supplier - overall coverage"
          ) && (
            <UnifiedSummaryMetrics
              type="supplier"
              costData={data_summaries.costMatrix}
              statusData={data_summaries.statusMatrix}
            />
          )}
          {view_modes_action_input_form_values?.summaries?.includes(
            "supplier - cost comparison matrix"
          ) && (
            <MatrixTable
              title="Cost Comparison Matrix"
              matrixData={data_summaries.costMatrix}
            />
          )}
          {view_modes_action_input_form_values?.summaries?.includes(
            "supplier - status comparison matrix"
          ) && (
            <MatrixTable
              title="Status Comparison Matrix"
              matrixData={data_summaries.statusMatrix}
            />
          )}
          {view_modes_action_input_form_values?.summaries?.includes(
            "supplier - status comparison bar chart"
          ) && <SupplierStackChart matrixData={data_summaries} type="status" />}

          {view_modes_action_input_form_values?.summaries?.includes(
            "supplier - cost comparison bar chart"
          ) && <SupplierStackChart matrixData={data_summaries} type="cost" />}
        </div>
      </>
    );
  }

  let data_summaries = processPaymentReconciliationData(data_items);
  return (
    <>
      {/* <MonacoEditor
          value={{
            // data_items: data_items,
            // data_matrix: processReconciliationData(data_items),
            // view_modes_action_input_form_values_summaries:
            //   view_modes_action_input_form_values?.summaries,
            data_summaries: data_summaries,
            // data_fieds: sortedRecords[`${action_input_form_values_key}`]
            //   ? sortedRecords[`${action_input_form_values_key}`].filter(
            //       (sortedRecord: any) =>
            //         selectedRecords[`${action_input_form_values_key}`]?.some(
            //           (selectedRecord: any) =>
            //             selectedRecord.name === sortedRecord.name
            //         )
            //     )
            //   : selectedRecords[`${action_input_form_values_key}`] || data_fields,
            // records: table.getSortedRowModel().rows.map((row) => row.original),
          }}
          language="json"
          height="25vh"
        /> */}
      <div className="pb-4">
        {view_modes_action_input_form_values?.summaries?.includes(
          "payment - overall coverage"
        ) && (
          <UnifiedSummaryMetrics
            type="payment"
            costData={data_summaries.paymentMatrix}
            statusData={data_summaries.statusMatrix}
            individualCostsData={data_summaries.individualCostsMatrix as any}
          />
        )}

        {view_modes_action_input_form_values?.summaries?.includes(
          "payment - amount comparison matrix"
        ) && (
          <PaymentMatrixTable
            title="Payment Amount Comparison Matrix"
            matrixData={data_summaries.paymentMatrix}
          />
        )}
        {view_modes_action_input_form_values?.summaries?.includes(
          "payment - status comparison matrix"
        ) && (
          <PaymentStatusMatrixTable
            title="Payment Status Comparison Matrix"
            matrixData={data_summaries.statusMatrix}
          />
        )}

        {view_modes_action_input_form_values?.summaries?.includes(
          "payment - amount comparison bar chart"
        ) && (
          <PaymentComparisonChart matrixData={data_summaries.paymentMatrix} />
        )}

        {view_modes_action_input_form_values?.summaries?.includes(
          "payment - status comparison bar chart"
        ) && <PaymentStatusChart matrixData={data_summaries.statusMatrix} />}
      </div>
    </>
  );
}

export default SummariesDisplay;
