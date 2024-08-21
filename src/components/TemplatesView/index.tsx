import { useAppStore } from "src/store";
import { ActionControlFormWrapper } from "@components/ActionControlForm";
import { useState } from "react";
import { Tabs } from "@mantine/core";
import DataDisplay from "@components/DataDisplay";
import { useFetchQueryDataByState } from "@components/Utils";

interface TemplatesViewProps {
  entity?: string;
  record?: any;
  // types?: string[];
  // state?: any;
  // read_write_mode?: string;
  // ui?: Record<string, any>;
}

export function TemplatesView({
  entity = "action_steps",
  record,
}: TemplatesViewProps) {
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
      <div>templatesview</div>
    </>
  );
}

interface TemplatesViewWrapperProps {
  query_name?: string;
  name?: string;
  action_type?: string;
  entity: string;
  record?: any;
  read_write_mode?: string;
  ui?: Record<string, any>;
}

export const TemplatesViewWrapper: React.FC<TemplatesViewWrapperProps> = ({
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
        resource_group={entity}
        execlude_components={[
          "input_mode",
          "submit_button",
          "columns",
          "custom_views",
          "save",
          "live_updates",
          "follow_up",
          "execute_selected",
          "execute_all",
          "view_as",
          "actions",
        ]}
        ui={ui}
      ></DataDisplay>
    </>
  );
};

export default TemplatesViewWrapper;
