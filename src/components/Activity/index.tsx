import { Text } from "@mantine/core";
import {
  inferDataTypes,
  useFetchActionPlanDataByState,
  useFetchActionStepDataByState,
  useFetchGenerativeComponentDataByStateAndModel,
  useFetchQueryDataByState,
  useFetchRecommendationDataByState,
  useReadRecordByState,
} from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import { useAppStore } from "src/store";
import _, { filter } from "lodash";
import MonacoEditor from "@components/MonacoEditor";
import { AggregateActionStepResultsWrapper } from "@components/AggregateActionStepResults";

interface ActionStepsProps {
  entity_type?: string;
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

export const ActivityWrapper = ({
  entity_type = "activity",
  aggregate_action_steps,
  record,
}: ActionStepsProps) => {
  const { activeTask, activeSession, activeView } = useAppStore();

  // let selected_record_items_key = `${action}_action_input_${record?.id}`;
  // const actionInputId = record?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  // let plan_action_input_form_values_key = `plan_${activeTask?.id}`;

  let activity_state = {
    id: record?.id,
    query_name: "read activity",
    task_id: activeTask?.id,
    session_id: activeSession?.id,
    view_id: activeView?.id,
    success_message_code: "activity",
  };
  const {
    data: activityData,
    isLoading: activityIsLoading,
    error: activityError,
  } = useFetchQueryDataByState(activity_state);

  let activity_view_read_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: "views:hxtnpwjnhhws9wuh0wr2",
    record: {
      id: "views:hxtnpwjnhhws9wuh0wr2",
    },
    read_record_mode: "remote",
  };

  const {
    data: activityViewData,
    isLoading: activityViewIsLoading,
    error: activityViewError,
  } = useReadRecordByState(activity_view_read_record_state);

  let activityViewRecord = activityViewData?.data?.find(
    (item: any) =>
      item?.message?.code ===
      activity_view_read_record_state?.success_message_code
  )?.data[0];

  if (activityError || activityViewError)
    return (
      <MonacoEditor
        value={{
          data: activityError?.response?.data,
          status: activityError?.response?.status,
        }}
        language="json"
        height="25vh"
      />
    );
  if (activityIsLoading || activityViewIsLoading) return <div>Loading...</div>;

  let activity =
    activityData?.data?.find(
      (item: any) =>
        item?.message?.code === activity_state?.success_message_code
    )?.data || [];

  // let all_action_steps =
  //   actionPlanData?.data?.find(
  //     (item: any) => item?.message?.code === "action_plan"
  //   )?.data || [];
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
  // let initial_state_read = all_action_steps?.filter((step: any) => {
  //   return step?.initial_state?.read === true;
  // });

  return (
    <>
      {/* <div>activity wrapper</div> */}
      {/* <div>{JSON.stringify(stepsToRender)}</div> */}
      {/* <div>action plan execution</div> */}
      {/* <MonacoEditor
        value={{
          // activityData: activityData,
          // activity: activity[0]?.items,
          // dataFields: inferDataTypes(activity[0]?.items),
          activityViewRecord: activityViewRecord,
          // filteredData: filtered_action_steps,
          // stepsToRender: stepsToRender
        }}
        language="json"
        height="25vh"
      /> */}
      {activity[0]?.items.length > 0 && (
        <DataDisplay
          data_items={activity[0]?.items}
          // data_fields={inferDataTypes(activity[0]?.items)}
          data_fields={activityViewRecord?.fields}
          view_mode="table"
        ></DataDisplay>
      )}

      {/* {stepsToRender && stepsToRender.length > 0 && aggregate_action_steps && (
        <AggregateActionStepResultsWrapper
          filtered_action_steps={stepsToRender}
        />
      )} */}
      {/* {initial_state_read &&
        initial_state_read.length > 0 &&
        aggregate_action_steps && (
          <AggregateActionStepResultsWrapper
            filtered_action_steps={initial_state_read}
          />
        )} */}

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

export default ActivityWrapper;
