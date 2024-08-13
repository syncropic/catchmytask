import { Text } from "@mantine/core";
import {
  useFetchGenerativeComponentDataByStateAndModel,
  useFetchRecommendationDataByState,
} from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import { useAppStore } from "src/store";
// import { access } from "fs";
// import { render } from "react-dom";
// import { v4 as uuidv4 } from "uuid";

interface RecommendationsProps {
  tasks?: any;
  action_steps?: any;
  services?: any;
  isLoading?: boolean;
}

export function Recommendations({
  tasks,
  action_steps,
  services,
  isLoading,
}: RecommendationsProps) {
  let task_recommendations_data_fields = [
    {
      name: "content",
      accessor: "content",
    },
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
      <div className="flex flex-col items-center align-middle">
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
      </div>
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

interface SearchRecommendationsProps {
  state: any;
  mode?: string;
}

export function SearchRecommendations({
  state,
  mode = "search",
}: SearchRecommendationsProps) {
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
  let task_recommendations_data_fields = [
    {
      name: "content",
      accessor: "content",
      render: (value: any) => {
        return <Text>custom render: {value}</Text>;
      },
    },
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
      <Recommendations
        tasks={
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          ).data[0]?.tasks
        }
        services={
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          ).data[0]?.services
        }
        action_steps={
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          ).data[0]?.action_steps
        }
        isLoading={recommendationDataIsLoading}
      ></Recommendations>
    </>
  );
}

interface GenerativeRecommendationsProps {
  state: any;
  mode?: string;
}

export function GenerativeRecommendations({
  state,
  mode = "generative",
}: GenerativeRecommendationsProps) {
  const {
    data: recommendationData,
    isLoading: recommendationDataIsLoading,
    error: recommendationDataError,
  } = useFetchGenerativeComponentDataByStateAndModel({ state: state });
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
  let task_recommendations_data_fields = [
    {
      name: "content",
      accessor: "content",
      render: (value: any) => {
        return <Text>custom render: {value}</Text>;
      },
    },
  ];
  return (
    <>
      {/* <div>generative recommendations</div> */}
      {/* <div>
        {JSON.stringify(
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          ).data
        ) || "no data"}
      </div> */}
      <Recommendations
        tasks={
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data[0]?.tasks
        }
        action_steps={
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data[0]?.action_steps
        }
        isLoading={recommendationDataIsLoading}
      ></Recommendations>
    </>
  );
}

// export default Recommendations;

interface RecommendationsGraphProps {
  mode?: string;
}

export const RecommendationsWrapper = ({
  mode = "search",
}: RecommendationsGraphProps) => {
  // create a state object called fieldDataMappings
  // this object will be used to store the data fetched from the backend
  // let fieldDataMappings = {};
  // const queryClient = useQueryClient();
  const { natural_language_query_form_values } = useAppStore();
  // length of the natural_language_query_form_values?.content_text has to be greater than 0 otherwise return null
  if (
    natural_language_query_form_values?.content_text?.length === 0 ||
    natural_language_query_form_values?.content_text === undefined
  ) {
    return null;
  }
  if (mode === "generative") {
    return (
      <div>
        <GenerativeRecommendations
          state={{
            natural_language_query:
              natural_language_query_form_values?.content_text,
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* {JSON.stringify(natural_language_query_form_values?.content_text)} */}
      <SearchRecommendations
        state={{
          natural_language_query:
            natural_language_query_form_values?.content_text,
        }}
      />
    </div>
  );
};

export default RecommendationsWrapper;
