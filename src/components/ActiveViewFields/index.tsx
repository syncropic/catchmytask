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
import { useQueryClient } from "@tanstack/react-query";
import { useParsed } from "@refinedev/core";
import { ListEditor } from "@components/ListEditor";

interface ListItemsProps {
  // entity_type: string;
  // display_mode?: string;
  // view_id?: string;
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

export const ActiveViewFields = ({}: ListItemsProps) => {
  const { params } = useParsed();
  let view_items = params?.view_items?.split(",");

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
      {/* {items && (!display_mode || display_mode === "json") && (
        <MonacoEditor value={items} language="json" height="75vh" />
      )} */}
      <div>
        {view_items &&
          view_items?.map((view_item: any) => {
            return <ViewItemFields view_item_id={view_item} />;
          })}

        {/* {JSON.stringify(views)} */}
        {/* {JSON.stringify(activeAction)} */}
        {/* {JSON.stringify(cachedData)} */}
        {/* <div>selectable, draggable fields list</div> */}
      </div>
    </>
  );
};

export default ActiveViewFields;

interface ViewItemFieldsProps {
  view_item_id: string;
  // entity_type: string;
  // display_mode?: string;
  // view_id?: string;
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

export const ViewItemFields = ({ view_item_id }: ViewItemFieldsProps) => {
  const {
    // activeApplication,
    // activeSession,
    // activeTask,
    // activeProfile,
    // activeView,
    views,
    activeAction,
    activeApplication,
  } = useAppStore();

  let view_item_record = views[view_item_id];

  let view_query_state = {
    // id:
    //   activeView?.id ||
    //   activeTask?.id ||
    //   activeSession?.id ||
    //   activeProfile?.id,
    func_name: "fetch_system_views",
    name: "fetch_system_views",
    // task_id: activeTask?.id,
    // session_id: activeSession?.id,
    // view_id: activeView?.id,
    // profile_id: activeProfile?.id,
    application_id: activeApplication?.id,
    // user_id: String(user_session?.userProfile?.user?.id),
    // author_id: identity?.email || "guest",
    view_name: view_item_record?.variables?.summary_message_view,
    success_message_code: "fetch_system_views",
  };

  let view_query_key = `useExecuteFunctionWithArgs_${JSON.stringify(
    view_query_state
  )}`;
  // const { params } = useParsed();
  // let view_items = params?.view_items?.split(",");

  // let list_items_state = {
  //   query_name: "search by entity type",
  //   application_id: activeApplication?.id,
  //   profile_id: activeProfile?.id,
  //   session_id: activeSession?.id,
  //   task_id: activeTask?.id,
  //   view_id: activeView?.id,
  //   entity_type: entity_type,
  //   success_message_code: "items",
  // };
  // const {
  //   data: itemsData,
  //   isLoading: itemsIsLoading,
  //   error: itemsError,
  // } = useFetchQueryDataByState(list_items_state);

  // if (itemsError)
  //   return (
  //     <MonacoEditor
  //       value={{
  //         data: itemsError?.response?.data,
  //         status: itemsError?.response?.status,
  //       }}
  //       language="json"
  //       height="25vh"
  //     />
  //   );
  // if (itemsIsLoading) return <div>Loading...</div>;

  // let items =
  //   itemsData?.data?.find(
  //     (item: any) =>
  //       item?.message?.code === list_items_state?.success_message_code
  //   )?.data || [];

  const queryClient = useQueryClient();

  // const cachedData = queryClient.getQueryData([
  //   view_query_key,
  // ]) as any;
  // console.log("cachedData");
  // console.log(cachedData);
  // console.log("activeAction?.reference_record");
  // console.log(activeAction?.reference_record);

  // let actionItem = cachedData?.data?.find
  //   ? cachedData?.data?.find(
  //       (item: any) =>
  //         item?.message?.code ===
  //         activeAction?.reference_record?.summary_message_code
  //     )
  //   : {};

  const cachedViewData = queryClient.getQueryData([view_query_key]) as any;

  let view_records = cachedViewData?.data?.find
    ? cachedViewData?.data?.find(
        (item: any) =>
          item?.message?.code === view_query_state?.success_message_code
      )?.data || []
    : null;
  let view_record = view_records ? view_records[0] : null;

  return (
    <>
      {view_record?.fields && (
        <ListEditor
          initial_list={view_record?.fields}
          list_id={view_item_id}
        ></ListEditor>
      )}
      {/* <div>{JSON.stringify(view_record?.fields)}</div> */}
    </>
  );
};
