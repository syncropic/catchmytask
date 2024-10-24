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
import _, { filter } from "lodash";
import MonacoEditor from "@components/MonacoEditor";
import { AggregateActionStepResultsWrapper } from "@components/AggregateActionStepResults";

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
  aggregate_action_steps?: boolean;
}

export const ActionStepsWrapper = ({
  entity_type = "action_steps",
  aggregate_action_steps,
  record,
}: 
ActionStepsProps) => {
  const { activeTask, selectedRecords } = useAppStore();

  // let selected_record_items_key = `${action}_action_input_${record?.id}`;
  // const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  let plan_action_input_form_values_key = `plan_${activeTask?.id}`;

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

  let all_action_steps =
    actionPlanData?.data?.find(
      (item: any) => item?.message?.code === "action_plan"
    )?.data || [];
  // let filtered_action_steps = all_action_steps?.filter(
  //   (item: { name: string }) =>
  //     item &&
  //     selectedRecords[`${plan_action_input_form_values_key}`]?.some(
  //       (record: { name: string }) => record.name === item?.name
  //     )
  // );

  // const stepsToRender =
  //   filtered_action_steps.length.length > 0
  //     ? filtered_action_steps.length
  //     : all_action_steps?.filter(
  //         (item: { name: string }) =>
  //           item &&
  //           activeTask?.initial_state?.action_steps?.some(
  //             (record: { name: string }) => record.name === item?.name
  //           )
  //       );
  // action steps where initial_state?.read is true
  let initial_state_read = all_action_steps?.filter((step: any) => {
    return step?.initial_state?.read === true;
  });

  return (
    <>
      {/* <div>{JSON.stringify(stepsToRender)}</div> */}
      {/* <div>action plan execution</div> */}
      {/* <MonacoEditor
        value={{
          // actionPlanData: actionPlanData,
          initial_state_read: initial_state_read
          // filteredData: filtered_action_steps,
          // stepsToRender: stepsToRender
        }}
        language="json"
        height="25vh"
      /> */}
      {/* {filtered_action_steps &&
        filtered_action_steps.length > 0 &&
        !aggregate_action_steps && (
          <DataDisplay
            data_items={filtered_action_steps}
            record={record || {}}
            data_fields={data_fields}
            entity_type={entity_type}
            display="datagridview"
            ui={{}}
            action="execute"
          ></DataDisplay>
        )} */}

      {/* {stepsToRender && stepsToRender.length > 0 && aggregate_action_steps && (
        <AggregateActionStepResultsWrapper
          filtered_action_steps={stepsToRender}
        />
      )} */}
        {initial_state_read && initial_state_read.length > 0 && aggregate_action_steps && (
        <AggregateActionStepResultsWrapper
          filtered_action_steps={initial_state_read}
        />
      )}

      {/* (
        <div className="flex items-center justify-center p-4">
          <p className="text-sm text-gray-600 text-center">
            Selected action step executions appear here.
          </p>
        </div>
      ) */}
    </>
  );
};

export default ActionStepsWrapper;
