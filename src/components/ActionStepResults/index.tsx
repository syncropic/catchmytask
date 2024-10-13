import DataDisplay from "@components/DataDisplay";
import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import { isAllLocalDBSuccess, useReadByState } from "@components/Utils";
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
      {/* <div>{JSON.stringify(record?.metadata?.query_run_location)}</div> */}
      {/* <ActionStepResults record={record}></ActionStepResults> */}
      {record?.metadata?.query_run_location === "local_db" ? (
        <ActionStepResultsLocalDB record={record} />
      ) : (
        <ActionStepResults record={record}></ActionStepResults>
      )}
    </>
  );
};

export function ActionStepResultsLocalDB({
  record,
  nested_item,
}: ActionStepResultsProps) {
  // let selected_record_items_key = `${action}_action_input_${record?.id}`;
  const dbInstance = useDuckDB(); // Get the DuckDB instance from the context

  const { activeTask, selectedRecords, local_db } = useAppStore();
  const actionInputId =
    activeTask?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  // use the plan to access all the action steps
  const action_input_form_values_key = `plan_action_input_${actionInputId}`;
  let selectedActionSteps = selectedRecords[`${action_input_form_values_key}`];

  // // State to store filtered data from DuckDB
  // const [dataItems, setDataItems] = useState([]);
  // const [dataFields, setDataFields] = useState([]);
  const [summaryData, setSummaryData] = useState<any[]>([]);

  let allLocalDBSuccess = isAllLocalDBSuccess(local_db, selectedActionSteps);

  // Effect to trigger DuckDB query whenever globalQuery or tableName changes
  useEffect(() => {
    // console.log("globalQuery", globalQuery);
    // console.log("tableName", tableName);
    // console.log("allLocalDBSuccess", allLocalDBSuccess);
    const fetchFromDuckDB = async () => {
      if (allLocalDBSuccess && selectedActionSteps && dbInstance) {
        // let data_fields =
        //   data?.data?.find(
        //     (item: any) => item?.message?.code === record?.success_message_code
        //   )?.data_fields || [];
        // console.log("globalQuery", globalQuery);
        // console.log("tableName", tableName);
        // console.log("data", data);
        // console.log("data_fields", data_fields);
        // setDataFields(data_fields);
        const results = [];
        try {
          // const conn = await initializeLocalDB();
          // console.log("allLocalDBSuccess", allLocalDBSuccess);
          // console.log("selectedActionSteps", selectedActionSteps);
          // filter only selected action steps when succcess_message_code is 'items_payment_analysis'
          // const tableName = "items_payment_analysis";
          // let filteredSelectedActionSteps = selectedActionSteps.filter(
          //   (item) => item.success_message_code === tableName
          // );

          // Set the max expression depth to a higher value
          // await conn.query("SET max_expression_depth TO 1000");
          // let query = globalQuery
          //   ? `SELECT * FROM ${tableName} WHERE ${globalQuery}`
          //   : `SELECT * FROM ${tableName}`;
          // console.log("Executing DuckDB query:", query);
          // const result = await conn.query(query);
          // console.log("DuckDB query result:", result);
          // Use the data fields from the fetched data
          // setDataItems(result.toArray());
          // close the connection
          // conn.close();
          // items to exclude from selected action steps where the success_message_code is 'summary'
          let excludeItems = ["summary"];
          let filteredSelectedActionSteps = selectedActionSteps.filter(
            (item: any) => !excludeItems.includes(item.success_message_code)
          );
          for (const table of filteredSelectedActionSteps) {
            const tableName = table.success_message_code;

            try {
              // Check if the table exists in the DuckDB database
              const checkTableQuery = `SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_name = '${tableName}'`;
              console.log(
                `Checking if table exists: ${tableName} // ${checkTableQuery}`
              );

              const tableCheckResult = await dbInstance.query(checkTableQuery);
              const tableExists = tableCheckResult.toArray()[0]?.count > 0;

              if (!tableExists) {
                console.log(`Table ${tableName} does not exist. Skipping.`);
                continue; // Skip to the next table
              }

              // Proceed to query the table if it exists
              const query = `SELECT COUNT(*) AS count FROM ${tableName}`;
              console.log(
                `Executing query for table: ${tableName} // ${query}`
              );

              const result = await dbInstance.query(query);
              let count = result.toArray()[0]?.count || 0;

              // Convert count to a regular number if it is a BigInt
              if (typeof count === "bigint") {
                count = Number(count);
              }

              // Add the result to the results array
              const resultItem = {
                id: tableName,
                name: table.name,
                success_message_code: tableName,
                count: count,
              };
              results.push(resultItem);
              console.log(`Result item for table ${tableName}:`, resultItem);
            } catch (error) {
              console.error(`Error querying table ${tableName}:`, error);
            }
          }

          // Set the summary data
          setSummaryData(results);
        } catch (err) {
          console.error("Error querying DuckDB:", err);
        }
      }
    };
    fetchFromDuckDB();
  }, [selectedActionSteps, allLocalDBSuccess, dbInstance]);

  let data_fields = [
    {
      name: "id",
      data_type: "string",
    },
    {
      name: "count",
      data_type: "number",
    },
    // {
    //   name: "average",
    //   data_type: "number",
    // },
    // {
    //   name: "sum",
    //   data_type: "number",
    // },
    // {
    //   name: "unique",
    //   data_type: "string",
    // },
    // {
    //   name: "trend",
    //   data_type: "string",
    // },
    // {
    //   name: "range",
    //   data_type: "string",
    // },
  ];

  return (
    <>
      {/* <div>ActionStepResultsLocalDB</div>
      <MonacoEditor
        value={{
          // selectedActionSteps: selectedActionSteps,
          // action_input_form_values_key: action_input_form_values_key,
          // allLocalDBSuccess: allLocalDBSuccess,
          // local_db: local_db,
          summaryData: summaryData,
        }}
        language="json"
        height="75vh"
      /> */}

      {summaryData && data_fields && (
        <DataDisplay
          data_items={summaryData || []}
          data_fields={data_fields}
          record={record}
          entity_type="action_step_results"
        />
      )}
    </>
  );
}
