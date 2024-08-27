import { useAppStore } from "src/store";
import DataDisplay from "@components/DataDisplay";
import { useFetchQueryDataByState } from "@components/Utils";

interface FileBrowserProps {
  entity?: string;
  record?: any;
  // types?: string[];
  // state?: any;
  // read_write_mode?: string;
  // ui?: Record<string, any>;
}

export function FileBrowser({
  entity = "action_steps",
  record,
}: FileBrowserProps) {
  const {
    // activeSession,
    activeAction,
    // activeRecord,
    // activeApplication,
    // activeResultsSection,
  } = useAppStore();
  let data_fields = [
    {
      name: "content",
      accessor: "content",
    },
    {
      name: "name",
      accessor: "name",
    },
  ];

  return (
    <>
      <div>FileBrowser</div>
    </>
  );
}

interface FileBrowserWrapperProps {
  query_name?: string;
  name?: string;
  action_type?: string;
  entity?: string;
  record?: any;
  read_write_mode?: string;
  ui?: Record<string, any>;
}

export const FileBrowserWrapper: React.FC<FileBrowserWrapperProps> = ({
  query_name,
  name,
  action_type,
  entity,
  record,
  read_write_mode = "read",
  ui = {},
}) => {
  let state = {
    query_name: query_name,
    // name: name,
    // action_type: action_type,
    entity: entity,
  };
  const {
    data: queryData,
    isLoading: queryDataIsLoading,
    error: queryDataError,
  } = useFetchQueryDataByState(state);

  // // console.log("actionFormFieldValues", actionFormFieldValues);
  if (queryDataError) return <div>Error: {JSON.stringify(queryDataError)}</div>;
  if (queryDataIsLoading) return <div>Loading...</div>;
  let data_fields = [
    {
      name: "name",
      accessor: "name",
    },
  ];
  return (
    <>
      {/* <div>{JSON.stringify(queryData)}</div> */}
      <DataDisplay
        data_items={
          queryData?.data?.find(
            (item: any) => item?.message?.code === "query_success_results"
          )?.data
        }
        data_fields={data_fields}
        read_write_mode={read_write_mode}
        isLoadingDataItems={queryDataIsLoading}
        resource_group={entity || "files"}
        execlude_components={[
          "custom_views_columns_view_as",
          "pagination",
          "live_updates",
          "save",
        ]}
        ui={ui}
      ></DataDisplay>
    </>
  );
};

export default FileBrowserWrapper;
