import { Text } from "@mantine/core";
import {
  useFetchActionPlanDataByState,
  useFetchActionStepDataByState,
  useFetchGenerativeComponentDataByStateAndModel,
  useFetchQueryDataByState,
  useFetchRecommendationDataByState,
} from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import { useAppStore } from "src/store";
import _ from "lodash";
import MonacoEditor from "@components/MonacoEditor";

interface ActionStepsProps {
  entity_type: string;
  types?: string[];
  state?: any;
  read_write_mode?: string;
  ui?: any;
  append_items?: any[];
  nested_item?: string | boolean;
  exclude_components?: string[];
  success_message_code?: string;
  invalidate_queries_on_submit_success?: string[];
  record?: any;
}

export const ActionStepsWrapper = ({
  entity_type = "action_steps",
  types,
  read_write_mode = "read",
  ui = {},
  record,
  nested_item = false,
  exclude_components,
  success_message_code = "query_success_results",
  invalidate_queries_on_submit_success,
}: // types,
ActionStepsProps) => {
  // let state = {
  //   // query_name: "action plan",
  //   query_name: "read action plan data",
  //   success_message_code: success_message_code,
  //   task_id: record?.id,
  //   // name: name,
  //   // action_type: action_type,
  //   // entity: entity,
  // };
  // let record =
  //   action_input_form_values[`task_b79aaba2-a0d1-4fa7-9b68-0baebbd1b321`];
  // // let actionStepRecord = {
  // //   ...record,
  // //   success_message_code: success_message_code,
  // //   execution_order: record?.execution_order || 1,
  // // };
  // const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  // // console.log("record", record);
  // let state = {
  //   action: {
  //     id: activeAction?.id,
  //     name: activeAction?.name,
  //   },
  //   input_values: {
  //     ...record,
  //     id: record?.id || actionInputId,
  //   },
  //   credential: record?.credential || "surrealdb_catchmytask",
  //   // data_model: data_model,
  //   application: {
  //     id: activeApplication?.id,
  //     name: activeApplication?.name,
  //   },
  //   session: {
  //     id: activeSession?.id,
  //     name: activeSession?.name,
  //   },
  //   task_variables: {},
  //   global_variables: {
  //     ...{},
  //   },
  //   include_execution_orders: [1],
  //   active_action_step_data: [],
  //   active_action_step_selected_data: [],
  //   action_steps: [
  //     {
  //       ...record,
  //       id: record?.id || actionInputId,
  //       execution_order: record?.execution_order || 1,
  //       description: record?.description || "generic description",
  //       name: record?.name || "generic name",
  //       job: record?.description || "generic job",
  //       method: record?.method || "select",
  //       type: record?.type || "action_steps",
  //       credential: record?.credential || "surrealdb_catchmytask",
  //       success_message_code: success_message_code,
  //     },
  //   ],
  // };
  // global_variables: global_variables,
  // action_steps: [actionStepRecord],
  // include_action_steps: [record?.execution_order || 0],
  // const {
  //   data: actionStepData,
  //   isLoading: actionStepDataIsLoading,
  //   error: actionStepDataError,
  // } = useFetchActionStepDataByState(state);

  // const { data, isLoading, error } = useFetchQueryDataByState(state);
  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }
  // if (error) {
  //   return <div>Error fetching action step data {JSON.stringify(error)}</div>;
  // }
  // // length of the natural_language_query_form_values?.content_text has to be greater than 0 otherwise return null
  // if (
  //   natural_language_query_form_values?.content_text?.length === 0 ||
  //   natural_language_query_form_values?.content_text === undefined
  // ) {
  //   return null;
  // }
  let action_plan_state = {
    id: record?.id,
    query_name: "read action plan data with task info",
    task_id: record?.id,
    success_message_code: "action_plan",
  };
  const {
    data: actionPlanData,
    isLoading: actionPlanIsLoading,
    error: actionPlanError,
  } = useFetchQueryDataByState(action_plan_state);

  let data_fields = [
    {
      name: "description",
    },
    {
      name: "execution_order",
    },
    {
      name: "dependencies",
    },
    {
      name: "confidence",
    },
    {
      name: "execution_runs",
    },
  ];
  if (actionPlanError)
    return (
      <MonacoEditor
        value={{
          data: actionPlanError?.response?.data,
          status: actionPlanError?.response?.status,
        }}
        language="json"
        height="25vh"
      />
    );
  if (actionPlanIsLoading) return <div>Loading...</div>;

  return (
    <>
      {/* <div>action plan execution</div> */}
      {/* <div>{JSON.stringify(actionPlanData)}</div> */}
      {/* <MonacoEditor value={data?.data} language="json" height="50vh" /> */}
      {/* {data && (
        <>
          <DataDisplay
            data_items={
              data?.data?.find(
                (item: any) => item?.message?.code === success_message_code
              )?.data || []
            }
            record={record || {}}
            data_fields={data_fields}
            entity_type={entity_type}
            isLoadingDataItems={isLoading}
            ui={{}}
            action="execute"
          ></DataDisplay>
        </>
      )} */}
      <DataDisplay
        data_items={
          actionPlanData?.data?.find(
            (item: any) => item?.message?.code === "action_plan"
          )?.data || []
        }
        record={record || {}}
        data_fields={data_fields}
        entity_type={entity_type}
        // isLoadingDataItems={isLoading}
        ui={{}}
        action="execute"
      ></DataDisplay>
    </>
  );
};

export default ActionStepsWrapper;
