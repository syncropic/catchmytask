import DataDisplay from "@components/DataDisplay";
import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import { useReadByState } from "@components/Utils";
import { useAppStore } from "src/store";
import { Text } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDuckDB } from "pages/_app"; // Import the useDuckDB hook

interface ActionStepResultsProps {
  record?: any;
  nested_item?: string;
}

// export function ActionStepResults({
//   // entity = "action_steps",
//   record,
//   nested_item,
// }: ActionStepResultsProps) {
//   // use read action step results by state
//   // Create the key with the transformed data_model.name
//   const {
//     action_input_form_values,
//     activeTask,
//     activeApplication,
//     activeSession,
//   } = useAppStore();

//   const actionInputId = "data_models:heblllgdhsuyfzpkg2tl";
//   const action_input_form_values_key = `action_input_${actionInputId}`;
//   let state = {
//     // global_variables: global_variables,
//     success_message_code: record?.success_message_code,
//     id: record?.id,
//     action_steps: [record],
//     application: {
//       id: activeApplication?.id,
//       name: activeApplication?.name,
//     },
//     session: {
//       id: activeSession?.id,
//       name: activeSession?.name,
//     },
//     task: {
//       id: activeTask?.id,
//       name: activeTask?.name,
//     },
//     input_values:
//       action_input_form_values[`${action_input_form_values_key}`] || {},
//     include_action_steps: [record?.execution_order || 0],
//     // input_values: action_input_form_values?.action_input || {},
//   };
//   const { data, isLoading, error, refetch } = useReadByState(state);

//   // Refetch query whenever the input values change
//   // useEffect(() => {
//   //   refetch();
//   // }, [proceed_action_input_form_values]); // Refetch when input values change
//   if (isLoading) {
//     return <div>Loading...</div>;
//   }
//   if (error) {
//     return <MonacoEditor value={error} language="json" height="75vh" />;
//   }
//   // const {
//   //   // activeSession,
//   //   activeAction,
//   //   // activeRecord,
//   //   // activeApplication,
//   //   // activeResultsSection,
//   // } = useAppStore();
//   // let data_fields = [
//   //   {
//   //     name: "id",
//   //     accessor: "id",
//   //   },
//   // ];
//   // let append_items = Array<AppendItems>();

//   return (
//     <>
//       {/* <div>ActionStepResults</div> */}
//       {/* <MonacoEditor value={data} language="json" height="75vh" /> */}
//       {/* <div>{JSON.stringify(record)}</div> */}
//       {/* <div>action step results</div> */}
//       {/* <div>{JSON.stringify(proceed_action_input_form_values)}</div> */}
//       {/* <MonacoEditor value={data?.data} language="json" height="50vh" /> */}
//       {/* <Reveal
//         trigger="click"
//         target={
//           <Text truncate="end" size="xs" className="text-blue-500 pl-3 pr-3">
//             {`${record.id} / ${record.name}`}
//           </Text>
//         }
//       >
//         <MonacoEditor value={record} language="json" height="50vh" />
//       </Reveal> */}
//       {/* if data.data contains at least one object with exit_code = 1 then show error message */}
//       {/* {data?.data?.find((item: any) => item?.exit_code === 1) && (
//         <MonacoEditor value={data} language="json" height="50vh" />
//       )} */}
//       {/* if data.data contains no object with exit_code = 1 then show success message */}
//       {data && data?.data?.find((item: any) => item?.exit_code !== 1) && (
//         <>
//           <DataDisplay
//             data_items={
//               data?.data?.find(
//                 (item: any) =>
//                   item?.message?.code === record?.success_message_code
//               )?.data || []
//             }
//             data_fields={
//               (
//                 data?.data?.find(
//                   (item: any) =>
//                     item?.message?.code === record?.success_message_code
//                 )?.data_fields || []
//               ).map((item: any) => ({
//                 name: item?.name,
//                 data_type: item?.data_type,
//                 accessor: item?.name,
//               })) || []
//             }
//             record={record}
//             entity_type="action_step_results"
//           ></DataDisplay>
//         </>
//       )}
//     </>
//   );
// }

export function ActionStepResults({
  record,
  nested_item,
}: ActionStepResultsProps) {
  const {
    action_input_form_values,
    activeTask,
    activeApplication,
    activeSession,
  } = useAppStore();
  const dbInstance = useDuckDB(); // Get the DuckDB instance from the context

  let tableName = record?.success_message_code;
  const actionInputId = record?.id || "data_models:heblllgdhsuyfzpkg2tl";
  const action_input_form_values_key = `action_input_${actionInputId}`;
  const task_action_input_form_values_key = `action_input_${activeTask?.id}`;

  let globalQuery =
    action_input_form_values[`${task_action_input_form_values_key}`]?.query ||
    null;

  let state = {
    success_message_code: record?.success_message_code,
    id: record?.id,
    action_steps: [record],
    application: {
      id: activeApplication?.id,
      name: activeApplication?.name,
    },
    session: {
      id: activeSession?.id,
      name: activeSession?.name,
    },
    task: {
      id: activeTask?.id,
      name: activeTask?.name,
    },
    input_values:
      action_input_form_values[`${action_input_form_values_key}`] || {},
    include_action_steps: [record?.execution_order || 0],
  };

  const { data, isLoading, error, refetch, isLocalDBSuccess } =
    useReadByState(state);

  const [dataItems, setDataItems] = useState<[]>([]);
  const [dataFields, setDataFields] = useState<[]>([]);

  useEffect(() => {
    const fetchFromDuckDB = async () => {
      if (dbInstance && data && isLocalDBSuccess) {
        let data_fields =
          data?.data?.find(
            (item: any) => item?.message?.code === record?.success_message_code
          )?.data_fields || [];
        setDataFields(data_fields);

        try {
          const query = globalQuery
            ? `SELECT * FROM ${tableName} WHERE ${globalQuery}`
            : `SELECT * FROM ${tableName}`;
          console.log("Executing DuckDB query:", query);

          // Execute the query using the DuckDB instance
          const result = await dbInstance.query(query);
          setDataItems(result.toArray());
        } catch (err) {
          console.error("Error querying DuckDB:", err);
        }
      }
    };

    fetchFromDuckDB();
  }, [dbInstance, globalQuery, tableName, data, isLocalDBSuccess]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <MonacoEditor value={error.toString()} language="json" height="75vh" />
    );
  }

  return (
    <>
      {dataFields && dataItems && (
        <DataDisplay
          data_items={dataItems || []}
          data_fields={dataFields || []}
          record={record}
          entity_type="action_step_results"
        />
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
