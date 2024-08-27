import { Text } from "@mantine/core";
import {
  useFetchActionPlanDataByState,
  useFetchQueryDataByState,
} from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import { useAppStore } from "src/store";
import _ from "lodash";
import {
  ActionInputForm,
  ActionStepsActionInputForm,
} from "@components/ActionInput";

interface TaskInputProps {
  entity?: string;
  types?: string[];
  state?: any;
  read_write_mode?: string;
  ui?: any;
  append_items?: any[];
  nested_item?: string | boolean;
  exclude_components?: string[];
  success_message_code?: string;
  invalidate_queries_on_submit_success?: string[];
  name?: string;
  description?: any;
  children?: any;
  query_name?: string;
}

export const TaskInputWrapper = ({
  entity = "task_input",
  types,
  read_write_mode = "read",
  ui = {},
  nested_item = false,
  exclude_components,
  success_message_code = "task_input_data",
  invalidate_queries_on_submit_success,
  description,
  children,
  query_name,
  name,
}: // types,
TaskInputProps) => {
  const {
    action_input_form_values,
    activeAction,
    activeApplication,
    activeSession,
  } = useAppStore();
  let state = {
    query_name: query_name || "task_input_data",
    success_message_code: success_message_code,
    // name: name,
    // action_type: action_type,
    // entity: entity,
  };
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
  const { data, isLoading, error } = useFetchQueryDataByState(state);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error fetching action step data {JSON.stringify(error)}</div>;
  }
  // // length of the natural_language_query_form_values?.content_text has to be greater than 0 otherwise return null
  // if (
  //   natural_language_query_form_values?.content_text?.length === 0 ||
  //   natural_language_query_form_values?.content_text === undefined
  // ) {
  //   return null;
  // }
  // let data_fields = [
  //   {
  //     name: "id",
  //     accessor: "id",
  //   },
  // ];

  return (
    <>
      {/* <div>task input wrapper</div> */}
      {/* <div>{JSON.stringify(data)}</div> */}
      {/* {actionStepData && (
        <>
          <DataDisplay
            data_items={
              actionStepData?.data?.find(
                (item: any) => item?.message?.code === success_message_code
              )?.data || []
            }
            data_fields={
              (
                actionStepData?.data?.find(
                  (item: any) => item?.message?.code === success_message_code
                )?.data_fields || []
              ).map((item: any) => ({
                name: item?.name,
                accessor: item?.name,
              })) ||
              data_fields ||
              []
            }
            read_write_mode={read_write_mode}
            isLoadingDataItems={actionStepDataIsLoading}
            resource_group={record?.execution_id}
            execlude_components={exclude_components}
            ui={{}}
            invalidate_queries_on_submit_success={
              invalidate_queries_on_submit_success
            }
          ></DataDisplay>
        </>
      )} */}
      {/* {(!data?.data && !error && !isLoading && description) || null} */}
      {data?.data && (
        <ActionInputForm
          data_model={
            data?.data?.find(
              (item: any) => item?.message?.code === success_message_code
            )?.data[0]?.data_model
          }
          // record={record}
          execlude_components={exclude_components}
          // name={name}
          // children={children}
          // nested_component={nested_component}
          // action_icon={action_icon}
          // setExpandedRecordIds={setExpandedRecordIds}
          // invalidate_queries_on_submit_success={
          //   invalidate_queries_on_submit_success
          // }
          // update_action_input_form_values_on_submit_success={
          //   update_action_input_form_values_on_submit_success
          // }
        ></ActionInputForm>
      )}
    </>
  );
};

export default TaskInputWrapper;
