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

interface ActionProps {
  success_message_code?: string;
  display_mode?: string;
  query_name?: string;
  view_id?: string;
  task_id: string;
  title?: any;
  data_items?: any[];
}

export const ActionsWrapper = ({
  display_mode,
  view_id,
  query_name,
  success_message_code,
  task_id,
  title,
  data_items,
}: ActionProps) => {
  const {
    activeTask,
    activeSession,
    activeView,
    activeProfile,
    activeApplication,
  } = useAppStore();

  // let activity_state = {
  //   id:
  //     activeView?.id ||
  //     activeTask?.id ||
  //     activeSession?.id ||
  //     activeProfile?.id,
  //   query_name: query_name || "fetch events",
  //   session_id: activeSession?.id,
  //   view_id: activeView?.id,
  //   profile_id: activeProfile?.id,
  //   application_id: activeApplication?.id,
  //   task_id: task_id || "default_task_id",
  //   success_message_code: success_message_code || "events",
  // };
  // const {
  //   data: activityData,
  //   isLoading: activityIsLoading,
  //   error: activityError,
  // } = useFetchQueryDataByState(activity_state);

  let activity_view_read_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: "views:i9474p42smg2b94hg465",
    record: {
      id: "views:i9474p42smg2b94hg465",
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

  // if (activityError || activityViewError)
  //   return (
  //     <MonacoEditor
  //       value={{
  //         data: activityError?.response?.data,
  //         status: activityError?.response?.status,
  //       }}
  //       language="json"
  //       height="25vh"
  //     />
  //   );
  // if (activityIsLoading || activityViewIsLoading) return <div>Loading...</div>;

  // let activity =
  //   activityData?.data?.find(
  //     (item: any) =>
  //       item?.message?.code === activity_state?.success_message_code
  //   )?.data || [];

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
          issue_id: issue_id,
          // activityData: activityData,
          // activity_state: activity_state,
          // activity: activity[0]?.items,
          // activity: activity,
          // dataFields: inferDataTypes(activity[0]?.items),
          // activityViewRecord: activityViewRecord,
          // filteredData: filtered_action_steps,
          // stepsToRender: stepsToRender
          // activity_view_read_record_state: activity_view_read_record_state,
        }}
        language="json"
        height="25vh"
      /> */}
      {/* {activity[0]?.items?.length > 0 && activityViewRecord && (
        <DataDisplay
          data_items={activity[0]?.items}
          data_fields={activityViewRecord?.fields}
          view_record={activityViewRecord}
          view_mode="table"
          title={title}
        ></DataDisplay>
      )} */}
      {data_items && data_items?.length > 0 && activityViewRecord && (
        <DataDisplay
          data_items={data_items}
          data_fields={activityViewRecord?.fields}
          view_record={activityViewRecord}
          view_mode="actions"
          title={title}
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

export default ActionsWrapper;
