import DataDisplay from "@components/DataDisplay";
import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import { useReadByState } from "@components/Utils";
import { useAppStore } from "src/store";
import { Text } from "@mantine/core";
import { useEffect } from "react";

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

// interface AppendItems {
//   name: string;
//   id: string;
// }

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
  // Create the key with the transformed data_model.name
  const { action_input_form_values, activeTask } = useAppStore();
  // const proceed_action_input_form_values_key = `proceed_execute_with_action_input_create_freshdesk_ticket_from_zoom_engagement_data_models:lefd1wja8dcfmpa7a0cq`;

  // const defaultValueObjects = [
  //   // actionInputIds,
  //   identity_object,
  //   record,
  //   action_input_form_values[action_input_form_values_key],
  //   action_input_form_values[proceed_action_input_form_values_key] || {},
  // ];
  // let proceed_action_input_form_values =
  //   action_input_form_values[proceed_action_input_form_values_key] || {};

  // // const { global_variables } = useAppStore();
  let state = {
    // global_variables: global_variables,
    success_message_code: record?.success_message_code,
    id: record?.id,
    action_steps: [record],
    include_action_steps: [record?.execution_order || 0],
    input_values: action_input_form_values?.action_input || {},
  };
  const { data, isLoading, error, refetch } = useReadByState(state);

  // Refetch query whenever the input values change
  // useEffect(() => {
  //   refetch();
  // }, [proceed_action_input_form_values]); // Refetch when input values change
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <MonacoEditor value={error} language="json" height="75vh" />;
  }
  // const {
  //   // activeSession,
  //   activeAction,
  //   // activeRecord,
  //   // activeApplication,
  //   // activeResultsSection,
  // } = useAppStore();
  // let data_fields = [
  //   {
  //     name: "id",
  //     accessor: "id",
  //   },
  // ];
  // let append_items = Array<AppendItems>();

  return (
    <>
      {/* <div>ActionStepResults</div> */}
      <MonacoEditor value={data} language="json" height="75vh" />
      {/* <div>{JSON.stringify(record)}</div> */}
      {/* <div>action step results</div> */}
      {/* <div>{JSON.stringify(proceed_action_input_form_values)}</div> */}
      {/* <MonacoEditor value={data?.data} language="json" height="50vh" /> */}
      {/* <Reveal
        trigger="click"
        target={
          <Text truncate="end" size="xs" className="text-blue-500 pl-3 pr-3">
            {`${record.id} / ${record.name}`}
          </Text>
        }
      >
        <MonacoEditor value={record} language="json" height="50vh" />
      </Reveal> */}
      {/* if data.data contains at least one object with exit_code = 1 then show error message */}
      {/* {data?.data?.find((item: any) => item?.exit_code === 1) && (
        <MonacoEditor value={data} language="json" height="50vh" />
      )} */}
      {/* if data.data contains no object with exit_code = 1 then show success message */}
      {/* {data && data?.data?.find((item: any) => item?.exit_code !== 1) && (
        <>
          <DataDisplay
            data_items={
              data?.data?.find(
                (item: any) =>
                  item?.message?.code === record?.success_message_code
              )?.data || []
            }
            data_fields={
              (
                data?.data?.find(
                  (item: any) =>
                    item?.message?.code === record?.success_message_code
                )?.data_fields || []
              )
                .filter((item: any) =>
                  record?.main_view_has_fields
                    ? record.main_view_has_fields.includes(item?.name)
                    : true
                )
                .map((item: any) => ({
                  name: item?.name,
                  accessor: item?.name,
                })) || []
            }
            record={record}
           
          ></DataDisplay>
        </>
      )} */}
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
      {/* <div>ActionStepResultsWrapper</div> */}
      {/* <div>action step results wrapper</div> */}
      {/* <div>{JSON.stringify(record)}</div> */}
      <ActionStepResults
        record={record}
        // execlude_components={execlude_components}
      ></ActionStepResults>
    </>
  );
};
