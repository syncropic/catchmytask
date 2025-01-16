import {
  useFetchQueryDataByState,
  useReadRecordByState,
} from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import { useAppStore } from "src/store";
import _, { filter } from "lodash";
import MonacoEditor from "@components/MonacoEditor";
import { useGetIdentity, useGo } from "@refinedev/core";
import { IIdentity } from "@components/interfaces";
import SearchInput from "@components/SearchInput";
import { useSession } from "next-auth/react";

interface ActionProps {
  success_message_code?: string;
  display_mode?: string;
  query_name?: string;
  view_id?: string;
  author_id?: string;
  title?: string;
}

export const SessionsWrapper = ({
  display_mode,
  view_id,
  query_name,
  success_message_code,
  author_id,
  title,
}: ActionProps) => {
  const {
    activeTask,
    activeSession,
    activeView,
    activeProfile,
    activeApplication,
    setActiveSession,
    clearViews,
  } = useAppStore();
  const { data: identity } = useGetIdentity<IIdentity>();
  const { data: user_session } = useSession();

  let query_state = {
    id:
      activeView?.id ||
      activeTask?.id ||
      activeSession?.id ||
      activeProfile?.id,
    query_name: query_name || "fetch sessions",
    task_id: activeTask?.id,
    session_id: activeSession?.id,
    view_id: activeView?.id,
    profile_id: activeProfile?.id,
    user_id: String(user_session?.userProfile?.user?.id),
    application_id: activeApplication?.id,
    author_id: identity?.email || "guest",
    success_message_code: success_message_code || "sessions",
  };
  const {
    data: queryData,
    isLoading: queryIsLoading,
    error: queryError,
  } = useFetchQueryDataByState(query_state);
  const go = useGo();

  // let activity_view_read_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: view_id || "views:hxtnpwjnhhws9wuh0wr2",
  //   record: {
  //     id: view_id || "views:hxtnpwjnhhws9wuh0wr2",
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: activityViewData,
  //   isLoading: activityViewIsLoading,
  //   error: activityViewError,
  // } = useReadRecordByState(activity_view_read_record_state);

  // let activityViewRecord = activityViewData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code ===
  //     activity_view_read_record_state?.success_message_code
  // )?.data[0];

  if (queryError)
    return (
      <MonacoEditor
        value={{
          data: queryError?.response?.data,
          status: queryError?.response?.status,
        }}
        language="json"
        height="25vh"
      />
    );
  if (queryIsLoading) return <div>Loading...</div>;

  let dataItems = queryData?.data?.find
    ? queryData?.data?.find(
        (item: any) => item?.message?.code === query_state?.success_message_code
      )?.data || []
    : null;

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

  // const { search_term, ...query_key_dict } = tasks_state;
  const handleSessionSelect = (record: any) => {
    if (record?.entity_type === "sessions") {
      setActiveSession(record);
      // clearViews
      clearViews({});
    }
    go({
      to: {
        resource: "sessions",
        action: "show",
        id: record?.id,
      },
      query: {
        profile_id: String(record?.profile_id) || activeProfile?.id,
        ...record?.initial_state?.params,
      },
      type: "push",
    });
  };

  return (
    <>
      {/* <div>activity wrapper</div> */}
      {/* <div>{JSON.stringify(stepsToRender)}</div> */}
      {/* <div>action plan execution</div> */}
      {/* <MonacoEditor
        value={{
          dataItems: dataItems?.[0]?.items,
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
      {dataItems?.[0]?.items && (
        <SearchInput
          placeholder="sessions"
          handleOptionSubmit={handleSessionSelect}
          data_items={dataItems?.[0]?.items}
          include_action_icons={
            user_session?.userProfile?.session_actions || []
          }
          activeFilters={[
            {
              id: 1,
              name: "sessions",
              description: "sessions",
              entity_type: "sessions",
              is_selected: true,
            },
          ]}
        />
      )}
      {/* {activity[0]?.items?.length > 0 && activityViewRecord && (
        <DataDisplay
          data_items={activity[0]?.items}
          // data_fields={inferDataTypes(activity[0]?.items)}
          data_fields={activityViewRecord?.fields}
          view_record={activityViewRecord}
          view_mode="table"
          title={title}
          query_key={`useFetchQueryDataByState_${JSON.stringify(tasks_state)}`}
        ></DataDisplay>
      )} */}

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

export default SessionsWrapper;
