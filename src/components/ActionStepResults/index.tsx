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

  const { data, isLoading, error, isLocalDBSuccess } = useReadByState(state);

  const [dataItems, setDataItems] = useState<[]>([]);
  // const [dataFields, setDataFields] = useState<[]>([]);

  // useEffect(() => {
  //   const fetchFromDuckDB = async () => {
  //     if (dbInstance && data && isLocalDBSuccess) {
  //       let data_fields =
  //         data?.data?.find(
  //           (item: any) => item?.message?.code === record?.success_message_code
  //         )?.data_fields || [];
  //       setDataFields(data_fields);

  //       try {
  //         const query = globalQuery
  //           ? `SELECT * FROM ${tableName} WHERE ${globalQuery}`
  //           : `SELECT * FROM ${tableName}`;
  //         console.log("Executing DuckDB query:", query);

  //         // Execute the query using the DuckDB instance
  //         const result = await dbInstance.query(query);
  //         setDataItems(result.toArray());
  //       } catch (err) {
  //         console.error("Error querying DuckDB:", err);
  //       }
  //     }
  //   };

  //   fetchFromDuckDB();
  // }, [dbInstance, globalQuery, tableName, data, isLocalDBSuccess]);
  useEffect(() => {
    const fetchFromDuckDB = async () => {
      if (dbInstance && data && isLocalDBSuccess) {
        console.log("Initializing data fetch from DuckDB");

        // // Ensure you're not querying on stale data
        // let data_fields =
        //   data?.data?.find(
        //     (item: any) => item?.message?.code === record?.success_message_code
        //   )?.data_fields || [];

        // setDataFields(data_fields);

        try {
          const query = globalQuery
            ? `SELECT * FROM ${tableName} WHERE ${globalQuery}`
            : `SELECT * FROM ${tableName}`;

          console.log("Executing DuckDB query:", query);

          // Execute the query using the DuckDB instance
          const result = await dbInstance.query(query);
          setDataItems(result.toArray());

          console.log("DuckDB Query Result:", result.toArray());
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
      {/* <MonacoEditor
        value={{
          data_items: dataItems,
          data_fieds:
            data?.data?.find(
              (item: any) =>
                item?.message?.code === record?.success_message_code
            )?.data_fields || [],
        }}
        language="json"
        height="75vh"
      /> */}

      {dataItems && (
        <DataDisplay
          data_items={dataItems || []}
          data_fields={
            data?.data?.find(
              (item: any) =>
                item?.message?.code === record?.success_message_code
            )?.data_fields || []
          }
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
      {/* <div>action step results wrapper</div> */}
      {/* <div>{JSON.stringify(record)}</div> */}
      <ActionStepResults record={record}></ActionStepResults>
    </>
  );
};
