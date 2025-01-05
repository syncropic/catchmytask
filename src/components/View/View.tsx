import AccordionComponent from "@components/AccordionComponent";
import DataDisplay from "@components/DataDisplay";
import ErrorComponent from "@components/ErrorComponent";
import MonacoEditor from "@components/MonacoEditor";
import PythonEnvironment from "@components/PythonEnvironment";
import {
  buildSQLQuery,
  enrichFilters,
  getLabel,
  getTooltipLabel,
  sanitizeFilters,
} from "@components/Utils";
import { useParsed } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { viewQueryAccordionConfig } from "./viewQueryAccordionConfig";
import { actionInputAccordionConfig } from "./actionInputAccordionConfig";
import { ActionInputForm } from "@components/ActionInput";
import { titleAccordionConfig } from "./titleAccordionConfig";
import { Tooltip, Text, LoadingOverlay, Box } from "@mantine/core";
import Reveal from "@components/Reveal";
import { useViewportSize } from "@mantine/hooks";
import Documentation from "@components/Documentation";
import { IconInfoCircle } from "@tabler/icons-react";
import { viewItemsAccordionConfig } from "./viewItemsAccordionConfig";
import ExecutionDataFetcher from "./ExecutionDataFetcher";

interface ViewProps {
  view_record: any;
}

export function View({ view_record }: ViewProps) {
  // custom hooks
  const [fetchedSteps, setFetchedSteps] = useState<Record<string, boolean>>({});
  const { params } = useParsed();

  const view_id = params?.view_id;
  const task_id = params?.id;
  const session_id = params?.session_id;

  // const dbInstance = useDuckDB(); // Get DuckDB instance
  const {
    activeSections,
    activeMainCustomComponent,
    // activeSummaryCustomComponents,
    activeRecordCustomComponents,
  } = useAppStore(); // Zustand store access

  const [dataItems, setDataItems] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoinInProgress, setIsJoinInProgress] = useState(false);
  // const previousActionSteps = useRef(action_steps);

  const query_action_input_form_values_key = `query_${task_id}`;

  const globalQuery =
    useAppStore(
      (state) =>
        state.action_input_form_values[`${query_action_input_form_values_key}`]
          ?.query
    ) || view_record?.query; // use query as default if nothing is in the global store

  const query_action_input_form_values = useAppStore(
    (state) =>
      state.action_input_form_values[query_action_input_form_values_key]
  );

  // const view_modes_action_input_form_values_key = `view_modes_${activeView?.id}`;

  // const view_modes_action_input_form_values = useAppStore(
  //   (state) =>
  //     state.action_input_form_values[view_modes_action_input_form_values_key]
  // );

  // let active_view_query_model_state = {
  //   id: view_id,
  //   query_name: "data_model",
  //   name: view_record?.["action_models"]?.["search"],
  //   success_message_code: "action_input_data_model_schema",
  // };

  // const {
  //   data: active_view_query_model_data,
  //   isLoading: active_view_query_model_isLoading,
  //   error: active_view_query_model_error,
  // } = useFetchQueryDataByState(active_view_query_model_state);

  const handleStepFetched = (stepId: string) => {
    setFetchedSteps((prev) => ({ ...prev, [stepId]: true }));
  };

  // const fieldMetadataList = getQueryFieldMetadata(action_steps, dataFields);
  // const filteredDataFields = concatenateAliasedDataFields(
  //   fieldMetadataList,
  //   action_steps,
  //   dataFields
  // );

  // let active_view_query_model_data_data_model_query_filters =
  //   active_view_query_model_data?.data?.find(
  //     (item: any) => item?.message?.code === "action_input_data_model_schema"
  //   )?.data[0]?.data_model?.schema?.query_filters;
  let active_view_query_model_data_data_model_query_filters =
    view_record?.data_model?.schema?.query_filters;
  let enriched_query_filters = enrichFilters(
    active_view_query_model_data_data_model_query_filters,
    query_action_input_form_values
  );

  useEffect(() => {
    // const allFetched = view_record?.metadata?.action_steps?.every(
    //   (step: string) => fetchedSteps[step] === true
    // );
    const allFetched = fetchedSteps[view_record?.id] === true;
    console.log("All fetched:", allFetched);

    // if (allFetched && !isJoinInProgress && !globalSearchQuery) {
    //   console.log("All steps fetched, executing join query...");
    //   setIsJoinInProgress(true);
    //   executeDynamicOuterJoin();
    // }
    // if (allFetched && !isJoinInProgress && globalSearchQuery) {
    //   console.log("All steps fetched, executing globalSearchQuery query...");
    //   // setIsJoinInProgress(true);
    //   // executeDynamicOuterJoin();
    //   let rendered_globalSearchQuery = buildSQLQuery(globalSearchQuery, sanitizeFilters(enriched_search_filters), { caseSensitive: false })?.query
    //   console.log("rendered_globalSearchQuery", rendered_globalSearchQuery)
    //   // executeQuery(globalSearchQuery);
    //   executeQuery(rendered_globalSearchQuery);
    // }
    if (allFetched && globalQuery) {
      let rendered_globalQuery = buildSQLQuery(
        globalQuery,
        sanitizeFilters(enriched_query_filters),
        { caseSensitive: false }
      )?.query;
      console.log("rendered_globalQuery", rendered_globalQuery);
      // executeQuery(globalSearchQuery);
      executeQuery(rendered_globalQuery);
    }
    if (allFetched && view_record && !globalQuery) {
      let rendered_globalSearchQuery = buildSQLQuery(
        view_record?.query,
        sanitizeFilters(enriched_query_filters),
        { caseSensitive: false }
      )?.query;
      console.log(
        "rendered_globalSearchQuery view_record",
        rendered_globalSearchQuery
      );
      // executeQuery(globalSearchQuery);
      executeQuery(rendered_globalSearchQuery);
    }
  }, [fetchedSteps, globalQuery, view_record]);

  const executeQuery = async (query: string) => {
    try {
      console.log("Executing query:\n", query);
      // const result = await dbInstance.query(query);
      // setDataItems(result.toArray());
      setIsLoading(false);
    } catch (error) {
      console.error("Error executing query:", error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  // if (active_view_query_model_isLoading) return <div>Loading...</div>;

  // if (active_view_query_model_error) {
  //   return (
  //     <ErrorComponent
  //       error={active_view_query_model_error}
  //       component={"Error loading active_view_query_model_error data"}
  //     />
  //   );
  // }

  return (
    <div>
      {/* <MonacoEditor
        value={{
          // view_record: view_record,
          query_action_input_form_values_key:
            query_action_input_form_values_key,
          // globalQuery: globalQuery,
          // active_view_query_model_data_data_model_query_filters:
          //   active_view_query_model_data_data_model_query_filters,
          // active_view_query_model_data: active_view_query_model_data,
          // enriched_query_filters: enriched_query_filters,
          // dataItems: dataItems,
        }}
        language="json"
        height="75vh"
      /> */}
      <Box pos="relative">
        <LoadingOverlay
          visible={fetchedSteps[view_record?.id] !== true}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        {/* {view_record && (
          <ExecutionDataFetcher
            view={view_record}
            view_id={view_id}
            task_id={task_id}
            session_id={session_id}
            onStepFetched={() => handleStepFetched(view_id)}
          />
        )} */}
        {view_record && dataItems && (
          <DataDisplay
            data_items={dataItems}
            entity_type="action_step_results"
            view_mode={activeMainCustomComponent?.name || "datagrid"}
            view_record={view_record}
            data_fields={view_record?.fields}
          />
        )}
        {/* <div>view component</div>
        <div>{JSON.stringify(params)}</div> */}
        {/* {isLoading ? (
          <div>Loading...</div>
        ) : dataItems.length > 0 ? (
          <DataDisplay
            data_items={dataItems}
            entity_type="action_step_results"
            display="datagridview"
            // data_fields={filteredDataFields}
            data_fields={views["catchmyvibe"]?.fields || []}
          />
        ) : (
          <div>No data available</div>
        )} */}
      </Box>
    </div>
  );
}
