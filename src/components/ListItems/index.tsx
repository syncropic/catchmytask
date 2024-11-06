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

interface ListItemsProps {
  entity_type: string;
  display_mode?: string;
  view_id?: string;
  // types?: string[];
  // state?: any;
  // read_write_mode?: string;
  // ui?: any;
  // append_items?: any[];
  // nested_item?: string | boolean;
  // exclude_components?: string[];
  // success_message_code?: string;
  // invalidate_queries_on_submit_success?: string[];
  // record?: any;
  // aggregate_action_steps?: boolean;
}

export const ListItemsWrapper = ({
  entity_type,
  display_mode,
}: ListItemsProps) => {
  const {
    activeApplication,
    activeSession,
    activeTask,
    activeProfile,
    activeView,
  } = useAppStore();

  let list_items_state = {
    query_name: "search by entity type",
    application_id: activeApplication?.id,
    profile_id: activeProfile?.id,
    session_id: activeSession?.id,
    task_id: activeTask?.id,
    view_id: activeView?.id,
    entity_type: entity_type,
    success_message_code: "items",
  };
  const {
    data: itemsData,
    isLoading: itemsIsLoading,
    error: itemsError,
  } = useFetchQueryDataByState(list_items_state);

  if (itemsError)
    return (
      <MonacoEditor
        value={{
          data: itemsError?.response?.data,
          status: itemsError?.response?.status,
        }}
        language="json"
        height="25vh"
      />
    );
  if (itemsIsLoading) return <div>Loading...</div>;

  let items =
    itemsData?.data?.find(
      (item: any) =>
        item?.message?.code === list_items_state?.success_message_code
    )?.data || [];

  return (
    <>
      {/* <div>action steps wrapper</div> */}
      {/* <div>{JSON.stringify(stepsToRender)}</div> */}
      {/* <div>action plan execution</div> */}
      {/* <MonacoEditor
        value={{
          // actionPlanData: actionPlanData,
          // items: items,
          list_items_state: list_items_state,
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
      {items && (!display_mode || display_mode === "json") && (
        <MonacoEditor value={items} language="json" height="75vh" />
      )}
    </>
  );
};

export default ListItemsWrapper;
