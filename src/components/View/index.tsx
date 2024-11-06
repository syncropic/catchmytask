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
  useFetchExecutionData,
  useFetchQueryDataByState,
  useReadByState,
  useReadRecordByState,
} from "@components/Utils";
import { useParsed } from "@refinedev/core";
import { useDuckDB } from "pages/_app";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { viewQueryAccordionConfig } from "./viewQueryAccordionConfig";
import { actionInputAccordionConfig } from "./actionInputAccordionConfig";
import { ActionInputForm } from "@components/ActionInput";
import { titleAccordionConfig } from "./titleAccordionConfig";
import { Tooltip, Text } from "@mantine/core";
import Reveal from "@components/Reveal";
import { useViewportSize } from "@mantine/hooks";
import Documentation from "@components/Documentation";
import { IconInfoCircle } from "@tabler/icons-react";

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

  const dbInstance = useDuckDB(); // Get DuckDB instance
  // const {
  //   activeSections,
  //   activeMainCustomComponent,
  //   activeSummaryCustomComponents,
  //   activeRecordCustomComponents,
  // } = useAppStore(); // Zustand store access

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
      const result = await dbInstance.query(query);
      setDataItems(result.toArray());
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
    <>
      {/* <MonacoEditor
        value={{
          // view_record: view_record,
          query_action_input_form_values_key:
            query_action_input_form_values_key,
          globalQuery: globalQuery,
          // active_view_query_model_data_data_model_query_filters:
          //   active_view_query_model_data_data_model_query_filters,
          // active_view_query_model_data: active_view_query_model_data,
          enriched_query_filters: enriched_query_filters,
          dataItems: dataItems,
        }}
        language="json"
        height="75vh"
      /> */}
      {view_record && (
        <ExecutionDataFetcher
          view={view_record}
          view_id={view_id}
          task_id={task_id}
          session_id={session_id}
          onStepFetched={() => handleStepFetched(view_id)}
        />
      )}
      {view_record && dataItems && (
        <DataDisplay
          data_items={dataItems}
          entity_type="action_step_results"
          view_mode={"datagrid"}
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
    </>
  );
}

interface ExecutionDataFetcherProps {
  view: any;
  view_id: string;
  task_id: string;
  session_id: string;
  onStepFetched: () => void;
}

function ExecutionDataFetcher({
  // step,
  view,
  onStepFetched,
  view_id,
  task_id,
  session_id,
}: ExecutionDataFetcherProps) {
  const { activeApplication } = useAppStore();
  const { data, isLocalDBSuccess, isLoading } = useFetchExecutionData({
    success_message_code: view?.success_message_code,
    id: view_id,
    // action_steps: [step],
    application: {
      id: activeApplication?.id,
      name: activeApplication?.name,
    },
    session: {
      id: session_id,
    },
    task: {
      id: task_id,
    },
    view: {
      id: view_id,
    },
    view_record: view,
    include_action_steps: view.metadata?.action_steps,
    action: {
      name: "read",
    },
    // input_values: {},
  });

  useEffect(() => {
    if (!isLoading && isLocalDBSuccess) {
      onStepFetched(); // Notify parent that this step is fetched
    }
  }, [isLoading, isLocalDBSuccess]);

  return null; // This component doesn't render any UI
}

const ViewWrapper = () => {
  const { params } = useParsed();
  const { width } = useViewportSize();

  const {
    activeTask,
    activeView,
    activeSession,
    activeProfile,
    activeApplication,
    action_input_form_fields,
    activeEvent,
  } = useAppStore();

  const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
  const fields = action_input_form_fields[action_input_form_values_key];

  const view_id = params?.view_id;
  const task_id = params?.task_id;
  const session_id = params?.session_id;

  let fetch_view_by_id_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: view_id,
    record: {
      id: view_id,
    },
    read_record_mode: "remote",
  };

  const {
    data: viewData,
    isLoading: viewIsLoading,
    error: viewError,
  } = useReadRecordByState(fetch_view_by_id_state);

  let view_record = viewData?.data?.find(
    (item: any) => item?.message?.code === view_id
  )?.data[0];

  // const globalQuery =
  //   useAppStore(
  //     (state) =>
  //       state.action_input_form_values[`${action_input_form_values_key}`]?.query
  //   ) || view_record?.query; // use query as default if nothing is in the global store

  // let activity_state = {
  //   id:
  //     activeView?.id ||
  //     activeTask?.id ||
  //     activeSession?.id ||
  //     activeProfile?.id,
  //   query_name: "fetch events",
  //   session_id: activeSession?.id,
  //   view_id: activeView?.id,
  //   profile_id: activeProfile?.id,
  //   application_id: activeApplication?.id,
  //   task_id: params?.id,
  //   success_message_code: "events",
  // };

  // const {
  //   data: activityData,
  //   isLoading: activityIsLoading,
  //   error: activityError,
  // } = useFetchQueryDataByState(activity_state);

  if (viewIsLoading) return <div>Loading...</div>;

  if (viewError) {
    return (
      <ErrorComponent
        error={viewError}
        component={"Error loading params data"}
      />
    );
  }

  return (
    <div className="h-[85vh] flex flex-col">
      {/* <div>view wrapper</div> */}
      {/* <MonacoEditor
        value={{
          view_record: view_record,
        }}
        height="25vh"
        language="json"
      ></MonacoEditor> */}
      <AccordionComponent
        sections={titleAccordionConfig}
        include_items={["toolbar"]}
        key="view_title"
        title={
          <div onClick={(e) => e.stopPropagation()}>
            <Reveal
              trigger="click"
              target={
                <Tooltip
                  multiline
                  w={220}
                  withArrow
                  transitionProps={{ duration: 200 }}
                  label={getTooltipLabel(view_record)}
                >
                  <div className="flex">
                    <Text
                      size="sm"
                      className="text-blue-500 truncate overflow-hidden whitespace-nowrap px-3"
                      style={{ maxWidth: width < 500 ? 100 : 500 }}
                    >
                      {getLabel(view_record)}
                    </Text>
                    <IconInfoCircle size={18} />
                  </div>
                </Tooltip>
              }
            >
              {/* <MonacoEditor value={view_record} language="json" height="50vh" /> */}
              <Documentation record={view_record}></Documentation>
            </Reveal>
          </div>
        }
      />
      {/* <AccordionComponent
        sections={viewQueryAccordionConfig}
        globalQuery={globalQuery}
      /> */}
      <div>{view_record && <View view_record={view_record} />}</div>

      {/* <ActionInputForm
        fields={fields}
        // data_model={
        //   data?.data?.find(
        //     (item: any) => item?.message?.code === success_message_code
        //   )?.data[0]?.data_model
        // }
        // record={
        //   read_record_mode
        //     ? recordData
        //     : recordData?.data?.find(
        //         (item: any) => item?.message?.code === record?.id
        //       )?.data[0]
        // }
        // records={records}
        // action={action}
        // children={children}
        // focused_item={focused_item}
      ></ActionInputForm> */}
      {/* <AccordionComponent
        sections={actionInputAccordionConfig}
        globalQuery={globalQuery}
      /> */}
      {/* {globalQuery && (
        <PythonEnvironment code={globalQuery}></PythonEnvironment>
      )} */}
    </div>
  );
};
export default ViewWrapper;
