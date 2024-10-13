import { ActionStepResultsWrapper } from "@components/ActionStepResults";
import MonacoEditor from "@components/MonacoEditor";
import { useFetchQueryDataByState } from "@components/Utils";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";

interface PinnedActionStepResultsProps {
  success_message_code: string;
}

export function PinnedActionStepResults({
  success_message_code,
}: PinnedActionStepResultsProps) {
  const { activeTask } = useAppStore();
  let action_plan_state = {
    id: activeTask?.id,
    query_name: "read action plan data with task info",
    task_id: activeTask?.id,
    success_message_code: "action_plan",
  };
  const { data, isLoading, error } =
    useFetchQueryDataByState(action_plan_state);

  // local state to store the action step filtered by success_message_code
  const [record, setRecord] = useState<any>({});
  const [dataItems, setDataItems] = useState<any[]>([]);
  // Function to filter data by a given success_message_code
  const filterByMessageCode = (data: any[], code: string) => {
    return (
      data?.find((item: any) => item?.success_message_code === code) || null
    );
  };

  // useEffect to first filter by hardcoded "action_plan" and then by success_message_code argument
  useEffect(() => {
    if (data?.data) {
      // Step 1: Filter the data_items by hardcoded "action_plan"
      const filteredActionPlanItems =
        data?.data?.find((item: any) => item?.message?.code === "action_plan")
          ?.data || [];

      // Step 2: Set the filteredActionPlanItems to state
      setDataItems(filteredActionPlanItems);

      // Step 3: Filter the filteredActionPlanItems further by the dynamic success_message_code
      const finalRecord = filterByMessageCode(
        filteredActionPlanItems,
        success_message_code
      );

      // Step 4: Set the final record to the record state
      setRecord(finalRecord);
    } else {
      // Reset states if data is not available
      setDataItems([]);
      setRecord(null);
    }
  }, [data, success_message_code]);
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
      {/* <div>pinned action step results</div> */}
      {/* <MonacoEditor
        value={{
          // data_items: dataItems,
          // record: record,
          // data_items:
          //   data?.data?.find(
          //     (item: any) => item?.message?.code === "action_plan"
          //   )?.data || [],
          // data_fields:
          //   data?.data?.find(
          //     (item: any) => item?.message?.code === "action_plan"
          //   )?.data_fields || [],
        }}
        language="json"
        height="75vh"
      /> */}
      {record && <ActionStepResultsWrapper record={record} />}

      {/* {dataItems && (
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
      )} */}
    </>
  );
}

export default PinnedActionStepResults;
