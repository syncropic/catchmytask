import DataDisplay from "@components/DataDisplay";
import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import { useQueryByState } from "@components/Utils";
import { useAppStore } from "src/store";
import { Text } from "@mantine/core";

interface LogsProps {
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

export function Logs({
  // entity = "action_steps",
  record,
  nested_item,
}: // queryKey,
// types,
// read_write_mode = "read",
// ui = {},
LogsProps) {
  // use read action step results by state

  // const { global_variables } = useAppStore();
  let state = {
    // global_variables: global_variables,
    name: record?.name,
    id: record?.id,
    action_steps: [record],
    include_action_steps: [record?.execution_order || 0],
  };
  const { data, isLoading, error } = useQueryByState(state);
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
      {/* <div>action step results</div> */}
      {/* <div>{JSON.stringify(record)}</div> */}
      {/* <div>{JSON.stringify(data)}</div> */}
      {/* <div>action step results</div> */}
      <Reveal
        trigger="click"
        target={
          <Text truncate="end" size="sm" className="text-blue-500 pl-3 pr-3">
            {`logs for ${record.id} / ${record.name}`}
          </Text>
        }
      >
        <MonacoEditor value={record} language="json" height="50vh" />
      </Reveal>

      <MonacoEditor value={data} language="json" height="50vh" />
      {/* {data && (
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
              ).map((item: any) => ({
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

export default Logs;

interface LogsProps {
  record?: any;
  execlude_components?: string[];
}

export const LogsWrapper = ({ record }: LogsProps) => {
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
      <Logs record={record}></Logs>
    </>
  );
};
