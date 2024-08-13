import { Text } from "@mantine/core";
import { useFetchGenerativeComponentDataByStateAndModel } from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import { useAppStore } from "src/store";
import MonacoEditor from "@components/MonacoEditor";
import { v4 as uuidv4 } from "uuid";

function objectToListOfRecordsWithUUID(obj: any) {
  return Object?.keys(obj)?.map((key) => ({
    id: uuidv4(),
    name: key,
    content: obj[key],
  }));
}

interface GenerativeComponentWrapperProps {
  mode?: string;
  type?: string;
  response_model?: string;
  object_to_list_of_records_with_uuid?: boolean;
  data_key?: string;
  data_fields?: any;
  instruction?: string;
  name?: string;
}

export const GenerativeComponentWrapper = ({
  instruction = "",
  mode = "generative",
  type = "recommendations",
  response_model = "GenerativeRecommendation",
  object_to_list_of_records_with_uuid = false,
  data_key,
  data_fields,
  name,
}: GenerativeComponentWrapperProps) => {
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
  return (
    <div>
      <GenerativeComponent
        state={{
          natural_language_query:
            natural_language_query_form_values?.content_text,
        }}
        type={type}
        mode={mode}
        response_model={response_model}
        object_to_list_of_records_with_uuid={
          object_to_list_of_records_with_uuid
        }
        data_key={data_key}
        data_fields={data_fields}
        instruction={instruction}
        name={name}
      />
    </div>
  );
};

export default GenerativeComponentWrapper;

interface GenerativeComponentProps {
  mode?: string;
  type?: string;
  response_model?: string;
  state: any;
  object_to_list_of_records_with_uuid?: boolean;
  data_key?: string;
  data_fields?: any;
  instruction?: string;
  name?: string;
}

let default_data_fields = [
  // {
  //   name: "name",
  //   accessor: "name",
  // },
  {
    name: "content",
    accessor: "content",
  },
];

export function GenerativeComponent({
  state,
  mode = "generative",
  response_model = "GenerativeRecommendation",
  type = "recommendations",
  object_to_list_of_records_with_uuid = false,
  data_key = "items",
  data_fields = default_data_fields,
  instruction = "",
  name = "GenerativeComponent",
}: GenerativeComponentProps) {
  const {
    data: recommendationData,
    isLoading: recommendationDataIsLoading,
    error: recommendationDataError,
  } = useFetchGenerativeComponentDataByStateAndModel({
    state: state,
    response_model: response_model,
    type: type,
    instruction: instruction,
  });
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
  return (
    <>
      {/* <div>{JSON.stringify(object_to_list_of_records_with_uuid)}</div> */}
      {/* <div>generative recommendations</div> */}
      {/* <div>
        {JSON.stringify(
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data
        ) || "no data"}
      </div> */}
      {/* <MonacoEditor
        value={
          recommendationData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data[0]
        }
        language="json"
        // setFieldValue={setFieldValue}
      /> */}
      <DataDisplay
        // data_items={
        //   object_to_list_of_records_with_uuid
        //     ? objectToListOfRecordsWithUUID(
        //         recommendationData?.data?.find(
        //           (item: any) => item?.message?.code === "query_success_results"
        //         )?.data[0]
        //       )
        //     : recommendationData?.data?.find(
        //         (item: any) => item?.message?.code === "query_success_results"
        //       )?.data
        // }
        data_items={
          object_to_list_of_records_with_uuid
            ? objectToListOfRecordsWithUUID(
                recommendationData?.data?.find(
                  (item: any) => item?.message?.code === "query_success_results"
                )?.data[0] || {}
              )
            : recommendationData?.data?.find(
                (item: any) => item?.message?.code === "query_success_results"
              )?.data[0][data_key]
        }
        data_fields={data_fields}
        isLoadingDataItems={recommendationDataIsLoading}
        resource_group={"natural_language_query_indicators"}
        name={name}
        execlude_components={[
          "global_search",
          "custom_views_columns_view_as",
          "pagination",
        ]}
      />
    </>
  );
}
