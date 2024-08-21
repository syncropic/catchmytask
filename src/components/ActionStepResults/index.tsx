import DataDisplay from "@components/DataDisplay";
import { useFetchActionStepDataByState } from "@components/Utils";
import { useAppStore } from "src/store";

interface ActionStepResultsProps {
  // entity?: string;
  record?: any;
  nested_item?: string;
  // queryKey?: string;
  // types?: string[];
  // state?: any;
  // read_write_mode?: string;
  // ui?: Record<string, any>;
}

interface AppendItems {
  name: string;
  id: string;
}

export function ActionStepResults({
  // entity = "action_steps",
  record,
  nested_item,
}: // queryKey,
// types,
// read_write_mode = "read",
// ui = {},
ActionStepResultsProps) {
  // use read action step results by state

  // const { global_variables } = useAppStore();
  let state = {
    // global_variables: global_variables,
    action_steps: [record],
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
  // const {
  //   // activeSession,
  //   activeAction,
  //   // activeRecord,
  //   // activeApplication,
  //   // activeResultsSection,
  // } = useAppStore();
  let data_fields = [
    {
      name: "id",
      accessor: "id",
    },
  ];
  // let append_items = Array<AppendItems>();

  return (
    <>
      {/* <div>action step results</div> */}
      {/* <div>{JSON.stringify(actionStepData)}</div> */}
      {actionStepData && (
        <>
          <DataDisplay
            data_items={
              nested_item
                ? actionStepData?.data?.find(
                    (item: any) =>
                      item?.message?.code === "query_success_results"
                  )?.data?.[0]?.[nested_item] || []
                : actionStepData?.data?.find(
                    (item: any) =>
                      item?.message?.code === "query_success_results"
                  )?.data || []
            }
            data_fields={
              (
                actionStepData?.data?.find(
                  (item: any) => item?.message?.code === "query_success_results"
                )?.data_fields || []
              ).map((item: any) => ({
                name: item?.name,
                accessor: item?.name,
              })) ||
              data_fields ||
              []
            }
            read_write_mode={"read"}
            isLoadingDataItems={actionStepDataIsLoading}
            resource_group={record?.execution_id}
            execlude_components={["columns", "custom_views"]}
            ui={{}}
          ></DataDisplay>
        </>
      )}
    </>
  );
}

export default ActionStepResults;

interface ActionStepResultsProps {
  record?: any;
  execlude_components?: string[];
}

export const ActionStepResultsWrapper = ({
  record,
  execlude_components,
}: ActionStepResultsProps) => {
  // let id = record?.id;
  // let queryKey = "";
  // if (!id?.startsWith("action_step")) {
  //   queryKey = `catch-action-step-${id}`;
  // }
  // console.log("monaco editor form input props", props);
  // const setValue = (value: any) => {
  //   props?.setFieldValue(
  //     props?.schema.title.toLowerCase().replace(/ /g, "_"),
  //     value
  //   );
  // };
  return (
    <>
      {/* <div>action step results wrapper</div> */}
      {/* <div>{JSON.stringify(record)}</div> */}
      <ActionStepResults
        record={record}
        execlude_components={execlude_components}
      ></ActionStepResults>
    </>
  );
};
