import { Text } from "@mantine/core";
import {
  useFetchActionStepDataByState,
  useFetchGenerativeComponentDataByStateAndModel,
  useFetchRecommendationDataByState,
} from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import { useAppStore } from "src/store";
import _ from "lodash";

interface ActionStepsProps {
  entity: string;
  types?: string[];
  state?: any;
  read_write_mode?: string;
  ui?: any;
  append_items?: any[];
  nested_item: string | boolean;
  exclude_components?: string[];
  success_message_code?: string;
}

export const ActionStepsWrapper = ({
  entity = "task",
  types,
  read_write_mode = "read",
  ui = {},
  nested_item = false,
  exclude_components,
  success_message_code = "query_success_results",
}: // types,
ActionStepsProps) => {
  const { action_input_form_values } = useAppStore();
  let record =
    action_input_form_values[`task_b79aaba2-a0d1-4fa7-9b68-0baebbd1b321`];
  let actionStepRecord = {
    ...record,
    success_message_code: success_message_code,
  };
  // console.log("record", record);
  let state = {
    // global_variables: global_variables,
    action_steps: [actionStepRecord],
    // include_action_steps: [record?.execution_order || 0],
  };
  const {
    data: actionStepData,
    isLoading: actionStepDataIsLoading,
    error: actionStepDataError,
  } = useFetchActionStepDataByState(state);
  if (actionStepDataIsLoading) {
    return <div>Loading...</div>;
  }
  if (actionStepDataError) {
    return (
      <div>
        Error fetching action step data {JSON.stringify(actionStepDataError)}
      </div>
    );
  }
  // // length of the natural_language_query_form_values?.content_text has to be greater than 0 otherwise return null
  // if (
  //   natural_language_query_form_values?.content_text?.length === 0 ||
  //   natural_language_query_form_values?.content_text === undefined
  // ) {
  //   return null;
  // }
  let data_fields = [
    {
      name: "id",
      accessor: "id",
    },
  ];

  return (
    <>
      {/* <div>action plan</div> */}
      {/* <div>{JSON.stringify(nested_item)}</div> */}
      {actionStepData && (
        <>
          <DataDisplay
            // data_items={
            //   nested_item
            //     ? actionStepData?.data?.find(
            //         (item: any) => item?.message?.code === success_message_code
            //       )?.data?.[0]?.[nested_item] || []
            //     : actionStepData?.data?.find(
            //         (item: any) => item?.message?.code === success_message_code
            //       )?.data || []
            // }
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
          ></DataDisplay>
        </>
      )}
    </>
  );
};

export default ActionStepsWrapper;

export function SearchComponent({
  state,
  entity,
  read_write_mode,
  ui,
  append_items,
}: ActionStepsProps) {
  const {
    data: recommendationData,
    isLoading: recommendationDataIsLoading,
    error: recommendationDataError,
  } = useFetchRecommendationDataByState(state);
  if (recommendationDataIsLoading) {
    return <div>Loading...</div>;
  }
  if (recommendationDataError) {
    return (
      <div>
        Error fetching recommendation data{" "}
        {JSON.stringify(recommendationDataError)}
      </div>
    );
  }
  let data_fields = [
    {
      name: "description",
      accessor: "description",
    },
    // {
    //   name: "name",
    //   accessor: "name",
    // },
  ];
  // let pinned_action_steps = [
  //   {
  //     id: "1",
  //     name: "pinned any action",
  //     description: "pinned any action",
  //     // content: "pinned any action",
  //   },
  // ];
  return (
    <>
      {/* <div>{JSON.stringify(ui)}</div> */}
      {/* <div>
        {JSON.stringify(
          _.unionBy(
            pinned_action_steps,
            recommendationData?.data?.find(
              (item: any) => item?.message?.code === "query_success_results"
            )?.data[0]?.[entity] || [],
            "id"
          )
        )}
      </div> */}
      {/* <SearchResults
        data_fields={data_fields}
        entity={entity}
        data_items={
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          ).data
        }
        isLoading={recommendationDataIsLoading}
      ></SearchResults> */}
      <DataDisplay
        data_items={_.unionBy(
          append_items,
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data[0]?.[entity] || [],
          "id"
        )}
        data_fields={data_fields}
        read_write_mode={read_write_mode}
        isLoadingDataItems={recommendationDataIsLoading}
        resource_group={entity}
        execlude_components={[
          "global_search",
          "custom_views_columns_view_as",
          "pagination",
          "live_action",
        ]}
        ui={ui}
      ></DataDisplay>
    </>
  );
}

interface SearchResultsProps {
  // tasks: any;
  // action_steps: any;
  // services: any;
  entity: string;
  data_items: any;
  data_fields: any;
  isLoading: boolean;
}

export function SearchResults({
  entity,
  data_items,
  data_fields,
  isLoading,
}: SearchResultsProps) {
  return (
    <>
      <div>{JSON.stringify(data_items)}</div>
      {/* <div className="flex flex-col items-center align-middle">
        <Text fw={700}>Tasks</Text>
        <DataDisplay
          data_items={tasks}
          data_fields={task_recommendations_data_fields}
          isLoadingDataItems={isLoading}
          resource_group={"task_recommendations"}
          execlude_components={[
            "global_search",
            "custom_views_columns_view_as",
            "pagination",
          ]}
        ></DataDisplay>
        <Text fw={700}>Services</Text>
        <DataDisplay
          data_items={services}
          data_fields={task_recommendations_data_fields}
          isLoadingDataItems={isLoading}
          resource_group={"services_recommendations"}
          execlude_components={[
            "global_search",
            "custom_views_columns_view_as",
            "pagination",
          ]}
        ></DataDisplay>
        <Text fw={700}>Action Steps</Text>
        <DataDisplay
          data_items={action_steps}
          data_fields={task_recommendations_data_fields}
          isLoadingDataItems={isLoading}
          resource_group={"action_steps_recommendations"}
          execlude_components={[
            "global_search",
            "custom_views_columns_view_as",
            "pagination",
          ]}
        ></DataDisplay>
      </div> */}
      {/* <div>
        Best recommendations for what to do next (next best actions), what to
        look at, what to avoid e.t.c based on the query graph, recent action and
        corresponding execution trace, and user profile and preferences
      </div> */}
      {/* <RecommendationsGraph></RecommendationsGraph> */}
      {/* dynamic recommendations depending on cursor position,
                      active action and user input and page 1) recent items i.e recent sessions, tasks etc */}
    </>
  );
}
