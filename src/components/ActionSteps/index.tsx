import { Text } from "@mantine/core";
import {
  useFetchGenerativeComponentDataByStateAndModel,
  useFetchRecommendationDataByState,
} from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import { useAppStore } from "src/store";

interface ActionStepsProps {
  entity: string;
  types?: string[];
  state?: any;
  read_write_mode?: string;
  ui?: Record<string, any>;
}

export const ActionStepsWrapper = ({
  entity = "action_steps",
  types,
  read_write_mode = "read",
  ui = {},
}: // types,
ActionStepsProps) => {
  const { natural_language_query_form_values } = useAppStore();
  // length of the natural_language_query_form_values?.content_text has to be greater than 0 otherwise return null
  if (
    natural_language_query_form_values?.content_text?.length === 0 ||
    natural_language_query_form_values?.content_text === undefined
  ) {
    return null;
  }

  return (
    <div>
      {/* ActionStepsWrapper */}
      <SearchComponent
        state={{
          natural_language_query:
            natural_language_query_form_values?.content_text,
        }}
        entity={entity}
        types={types}
        read_write_mode={read_write_mode}
        ui={ui}
      ></SearchComponent>
    </div>
  );
};

export default ActionStepsWrapper;

export function SearchComponent({
  state,
  entity,
  read_write_mode,
  ui,
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
      name: "content",
      accessor: "content",
    },
    // {
    //   name: "name",
    //   accessor: "name",
    // },
  ];
  return (
    <>
      {/* <div>
        {JSON.stringify(
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          ).data[0]
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
        data_items={
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data[0]?.[entity]
        }
        data_fields={data_fields}
        read_write_mode={read_write_mode}
        isLoadingDataItems={recommendationDataIsLoading}
        resource_group={"action_steps_recommendations"}
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
