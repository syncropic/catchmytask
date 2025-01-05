import DataDisplay from "@components/DataDisplay";
import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import {
  aliasDataFields,
  buildSQLQuery,
  concatenateAliasedDataFields,
  createIssueIdSubquery,
  enrichFilters,
  generateTableAlias,
  getPreferredColumn,
  getQueryFieldMetadata,
  isAllLocalDBSuccess,
  sanitizeFilters,
  useFetchQueryDataByState,
  useReadRecordByState,
} from "@components/Utils";
import { useAppStore } from "src/store";
import { Text } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { set } from "lodash";
import nunjucks from "nunjucks";
import SummariesDisplay from "@components/SummariesDisplay";
import RecordsDisplay from "@components/RecordsDisplay";

interface AggregateActionStepResultsProps {
  action_steps?: any[];
}

export function AggregateActionStepResults({
  action_steps = [],
}: AggregateActionStepResultsProps) {
  // const dbInstance = useDuckDB(); // Get DuckDB instance
  // const {
  //   activeSections,
  //   activeView,
  //   activeMainCustomComponent,
  //   activeSummaryCustomComponents,
  //   activeRecordCustomComponents,
  // } = useAppStore(); // Zustand store access

  // const [fetchedSteps, setFetchedSteps] = useState<Record<string, boolean>>({});
  // const [dataItems, setDataItems] = useState<[]>([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [isJoinInProgress, setIsJoinInProgress] = useState(false);
  // const previousActionSteps = useRef(action_steps);

  // const search_action_input_form_values_key = `query_${activeView?.id}`;

  // const globalSearchQuery = useAppStore(
  //   (state) =>
  //     state.action_input_form_values[`${search_action_input_form_values_key}`]
  //       ?.query
  // );

  // const search_action_input_form_values = useAppStore(
  //   (state) =>
  //     state.action_input_form_values[search_action_input_form_values_key]
  // );

  // const view_modes_action_input_form_values_key = `view_modes_${activeView?.id}`;

  // const view_modes_action_input_form_values = useAppStore(
  //   (state) =>
  //     state.action_input_form_values[view_modes_action_input_form_values_key]
  // );

  // let active_view_search_model_state = {
  //   id: activeView?.id,
  //   query_name: "data_model",
  //   name: activeView?.["action_models"]?.["search"],
  //   success_message_code: "action_input_data_model_schema",
  // };

  // const {
  //   data: active_view_search_model_data,
  //   isLoading: active_view_search_model_isLoading,
  //   error: active_view_search_model_error,
  // } = useFetchQueryDataByState(active_view_search_model_state);

  // const handleStepFetched = (stepId: string) => {
  //   setFetchedSteps((prev) => ({ ...prev, [stepId]: true }));
  // };

  // const executeQuery = async (query: string) => {
  //   try {
  //     console.log("Executing query:\n", query);
  //     const result = await dbInstance.query(query);
  //     setDataItems(result.toArray());
  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Error executing query:", error);
  //     setIsLoading(false);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // // const executeDynamicOuterJoin = async () => {
  // //   try {
  // //     let query;
  // //     if (action_steps.length === 1) {
  // //       const step = action_steps[0];
  // //       const alias = generateTableAlias(step.success_message_code);
  // //       const fields = dataFields[step.success_message_code] || [];

  // //       const fieldSelections = fields
  // //         .map(
  // //           (field: any) => `${alias}.${field.name} AS ${alias}_${field.name}`
  // //         )
  // //         .join(",\n    ");

  // //       query = `
  // //         SELECT
  // //           ${fieldSelections}
  // //         FROM
  // //           ${step.success_message_code} ${alias};
  // //       `.trim();
  // //     } else {
  // //       const fieldSelections = action_steps.flatMap((step) => {
  // //         const alias = generateTableAlias(step.success_message_code);
  // //         const fields = dataFields[step.success_message_code] || [];
  // //         const relationType =
  // //           step.primary_step_relation?.cardinality || "one-to-one";

  // //         if (relationType === "one-to-many") {
  // //           const preferredColumn = getPreferredColumn(fields);
  // //           return [
  // //             `COUNT(${alias}.id) AS ${alias}_count`,
  // //             `GROUP_CONCAT(${alias}.${preferredColumn}) AS ${alias}_${preferredColumn}`,
  // //           ];
  // //         } else {
  // //           return fields.map(
  // //             (field: any) => `${alias}.${field.name} AS ${alias}_${field.name}`
  // //           );
  // //         }
  // //       });

  // //       const joinClauses = action_steps.reduce((acc, step, index) => {
  // //         const alias = generateTableAlias(step.success_message_code);
  // //         if (index === 0) return `${step.success_message_code} ${alias}`;
  // //         return `${acc} FULL OUTER JOIN ${step.success_message_code} ${alias} USING (issue_id)`;
  // //       }, "");

  // //       const groupByFields = action_steps.flatMap((step) => {
  // //         const alias = generateTableAlias(step.success_message_code);
  // //         const fields = dataFields[step.success_message_code] || [];
  // //         const relationType =
  // //           step.primary_step_relation?.cardinality || "one-to-one";

  // //         if (relationType === "one-to-many") {
  // //           return [`${alias}.issue_id`];
  // //         } else {
  // //           return fields.map((field: any) => `${alias}.${field.name}`);
  // //         }
  // //       });

  // //       query = `
  // //         SELECT
  // //           ${fieldSelections.join(",\n    ")}
  // //         FROM
  // //           ${joinClauses}
  // //         GROUP BY
  // //           ${groupByFields.join(",\n    ")};
  // //       `.trim();
  // //     }

  // //     executeQuery(query);
  // //   } catch (error) {
  // //     console.error("Error executing query:", error);
  // //   }
  // // };

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

  // let view_record = viewData?.data?.find(
  //   (item: any) => item?.message?.code === activeView?.id
  // )?.data[0];

  // // const fieldMetadataList = getQueryFieldMetadata(action_steps, dataFields);
  // // const filteredDataFields = concatenateAliasedDataFields(
  // //   fieldMetadataList,
  // //   action_steps,
  // //   dataFields
  // // );

  // let active_view_search_model_data_data_model_search_filters =
  //   active_view_search_model_data?.data?.find(
  //     (item: any) => item?.message?.code === "action_input_data_model_schema"
  //   )?.data[0]?.data_model?.schema?.search_filters;
  // let enriched_search_filters = enrichFilters(
  //   active_view_search_model_data_data_model_search_filters,
  //   search_action_input_form_values
  // );

  // useEffect(() => {
  //   const allFetched = action_steps.every(
  //     (step) => fetchedSteps[step.id] === true
  //   );
  //   console.log("All fetched:", allFetched);

  //   // if (allFetched && !isJoinInProgress && !globalSearchQuery) {
  //   //   console.log("All steps fetched, executing join query...");
  //   //   setIsJoinInProgress(true);
  //   //   executeDynamicOuterJoin();
  //   // }
  //   // if (allFetched && !isJoinInProgress && globalSearchQuery) {
  //   //   console.log("All steps fetched, executing globalSearchQuery query...");
  //   //   // setIsJoinInProgress(true);
  //   //   // executeDynamicOuterJoin();
  //   //   let rendered_globalSearchQuery = buildSQLQuery(globalSearchQuery, sanitizeFilters(enriched_search_filters), { caseSensitive: false })?.query
  //   //   console.log("rendered_globalSearchQuery", rendered_globalSearchQuery)
  //   //   // executeQuery(globalSearchQuery);
  //   //   executeQuery(rendered_globalSearchQuery);
  //   // }
  //   if (allFetched && globalSearchQuery) {
  //     let rendered_globalSearchQuery = buildSQLQuery(
  //       globalSearchQuery,
  //       sanitizeFilters(enriched_search_filters),
  //       { caseSensitive: false }
  //     )?.query;
  //     console.log("rendered_globalSearchQuery", rendered_globalSearchQuery);
  //     // executeQuery(globalSearchQuery);
  //     executeQuery(rendered_globalSearchQuery);
  //   }
  //   if (allFetched && view_record && !globalSearchQuery) {
  //     let rendered_globalSearchQuery = buildSQLQuery(
  //       view_record?.query,
  //       sanitizeFilters(enriched_search_filters),
  //       { caseSensitive: false }
  //     )?.query;
  //     console.log(
  //       "rendered_globalSearchQuery view_record",
  //       rendered_globalSearchQuery
  //     );
  //     // executeQuery(globalSearchQuery);
  //     executeQuery(rendered_globalSearchQuery);
  //   }
  // }, [fetchedSteps, action_steps, globalSearchQuery, view_record]);

  return (
    <>
      {/* <pre>{JSON.stringify(globalSearchQuery)}</pre>
      <div>{JSON.stringify(search_action_input_form_values_key)}</div> */}
      {/* <pre>{JSON.stringify(action_steps.map((step) => step.id))}</pre>
      <pre>{JSON.stringify(isLoading)}</pre> */}
      {/* <div>{JSON.stringify(action_steps)}</div> */}
      {/* <MonacoEditor
        value={{
          view_modes_action_input_form_values:
            view_modes_action_input_form_values,
          // globalSearchQuery: globalSearchQuery,
          // view_record_query: view_record?.query
          // action_steps: action_steps
          // viewRecord: viewRecord,
          // data_fields: dataFields
          // view_record_fields: view_record?.fields
          // search_action_input_form_values: search_action_input_form_values,
          // active_view_search_model: activeView?.["action_models"]?.["search"],
          // active_view_search_model_data_data_model: active_view_search_model_data?.data?.find(
          //   (item: any) => item?.message?.code === "action_input_data_model_schema"
          // )?.data[0]?.data_model,
          // active_view_search_model_data_data_model_search_filters: active_view_search_model_data?.data?.find(
          //   (item: any) => item?.message?.code === "action_input_data_model_schema"
          // )?.data[0]?.data_model?.schema?.search_filters
          // enriched_search_filters: enriched_search_filters,
          // rendered_global_search_query: renderSQLTemplate(globalSearchQuery, enriched_search_filters),
          // sanitizedFilters: sanitizeFilters(enriched_search_filters),
          // improved_rendered_global_search_query: buildSQLQuery(globalSearchQuery, sanitizeFilters(enriched_search_filters || []), { caseSensitive: false })
        }}
        language="json"
        height="25vh"
      /> */}
      {/* {action_steps.map((step: any) => (
        <ActionStepFetcher
          key={step.id}
          step={step}
          onStepFetched={() => handleStepFetched(step.id)}
        />
      ))}

      {isLoading && <div>Loading...</div>}
      {!isLoading && view_record?.fields && dataItems && (
        <RecordsDisplay data_items={dataItems} />
      )}
      {!isLoading &&
        view_record?.fields &&
        dataItems &&
        activeSections["summary"]?.isDisplayed && (
          <SummariesDisplay
            data_items={dataItems}
          />
        )}
      {!isLoading && view_record?.fields && dataItems && (
        <DataDisplay
          data_items={dataItems}
          entity_type="action_step_results"
          view_mode={activeMainCustomComponent?.name || "datagrid"}
          data_fields={view_record?.fields}
        />
      )} */}

      {/* {isLoading ? (
        <div>Loading...</div>
      ) : dataItems.length > 0 ? (
        <DataDisplay
          data_items={dataItems}
          entity_type="action_step_results"
          display="datagridview"
          // data_fields={filteredDataFields}
          data_fields={dataFields["supplier_analysis"] || []}
          // data_fields={views["catchmyvibe"]?.fields || []}
        />
      ) : (
        <div>No data available</div>
      )} */}
    </>
  );
}

export default AggregateActionStepResults;

interface ActionStepFetcherProps {
  step: any;
  onStepFetched: () => void;
}

// function ActionStepFetcher({ step, onStepFetched }: ActionStepFetcherProps) {
//   const {
//     action_input_form_values,
//     activeTask,
//     activeApplication,
//     activeSession,
//   } = useAppStore();
//   const { data, isLocalDBSuccess, isLoading } = useReadByState({
//     success_message_code: step.success_message_code,
//     id: step.id,
//     action_steps: [step],
//     application: {
//       id: activeApplication?.id,
//       name: activeApplication?.name,
//     },
//     session: {
//       id: activeSession?.id,
//       name: activeSession?.name,
//     },
//     task: {
//       id: activeTask?.id,
//       name: activeTask?.name,
//     },
//     input_values: {},
//     include_action_steps: [step?.execution_order || 0],
//   });

//   useEffect(() => {
//     if (!isLoading && isLocalDBSuccess) {
//       onStepFetched(); // Notify parent that this step is fetched
//     }
//   }, [isLoading, isLocalDBSuccess]);

//   return null; // This component doesn't render any UI
// }

interface AggregateActionStepResultsProps {
  // record?: any;
  // execlude_components?: string[];
  filtered_action_steps?: any[];
}

export const AggregateActionStepResultsWrapper = ({
  filtered_action_steps,
}: AggregateActionStepResultsProps) => {
  const { activeView } = useAppStore();
  return (
    <>
      {/* <div>action step results wrapper</div> */}
      {/* <MonacoEditor
        value={{
          filtered_action_steps: filtered_action_steps,
        }}
        language="json"
        height="75vh"
      /> */}
      {activeView && (
        <AggregateActionStepResults action_steps={filtered_action_steps} />
      )}
    </>
  );
};
