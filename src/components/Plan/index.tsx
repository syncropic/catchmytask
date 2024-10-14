import {
  useFetchActionStepsDataByState,
  useFetchDataModelByState,
  useFetchQueryDataByState,
  useReadRecordByState,
} from "@components/Utils";
import {
  PlanWrapperProps,
  ActionStepsActionInputFormProps,
} from "@components/interfaces";
import _ from "lodash";
import MonacoEditor from "@components/MonacoEditor";
import { ActionInputForm } from "@components/ActionInput";

// export default ActionInput;

export const PlanWrapper: React.FC<PlanWrapperProps> = ({
  query_name,
  name,
  execution_record,
  action_type,
  entity,
  record,
  children,
  success_message_code,
  description,
  records,
  action,
  focused_item,
}) => {
  // get the action step data model
  let state = {
    id: execution_record?.id,
    query_name,
    name,
    action_type,
    entity,
    success_message_code,
  };
  const { data, isLoading, error } = useFetchQueryDataByState(state);

  let action_plan_state = {
    id: record?.id,
    query_name: "read action plan data with task info",
    task_id: record?.id,
    success_message_code: "action_plan",
  };
  const {
    data: actionPlanData,
    isLoading: actionPlanIsLoading,
    error: actionPlanError,
  } = useFetchQueryDataByState(action_plan_state);

  // let read_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: record?.id,
  //   record: record,
  //   read_record_mode: read_record_mode || "remote",
  // };

  // const {
  //   data: actionPlanData,
  //   isLoading: actionPlanIsLoading,
  //   error: actionPlanError,
  // } = useReadRecordByState(read_record_state);

  if (error)
    return (
      <MonacoEditor
        value={{ data: error?.response?.data, status: error?.response?.status }}
        language="json"
        height="25vh"
      />
    );
  if (isLoading || actionPlanIsLoading) return <div>Loading...</div>;

  return (
    <>
      {/* <MonacoEditor value={data} language="json" height="50vh" /> */}
      {/* <MonacoEditor value={actionPlanData} language="json" height="50vh" /> */}
      {/* <MonacoEditor
        value={
          recordData?.data?.find(
            (item: any) => item?.message?.code === record?.id
          )?.data[0]
        }
        language="json"
        height="50vh"
      /> */}

      {/* <div>
        {JSON.stringify(
          recordData?.data?.find(
            (item: any) => item?.message?.code === record?.id
          )?.data[0]
        )}
      </div> */}
      {/* <div>{JSON.stringify(execution_record)}</div>
    <div>{JSON.stringify(record)}</div> */}
      {/* <>{JSON.stringify(recordData)}</> */}
      {/* <div>
        {JSON.stringify(
          data?.data?.find(
            (item: any) => item?.message?.code === success_message_code
          )?.data[0]?.data_model
        )}
      </div> */}
      {/* <MonacoEditor
        value={
          actionPlanData?.data?.find(
            (item: any) => item?.message?.code === "action_plan"
          )?.data
        }
        language="json"
        height="50vh"
      /> */}

      <div>
        {(!data?.data && !error && !isLoading && description) || null}

        {data?.data && actionPlanData?.data && query_name && (
          <ActionInputForm
            data_model={
              data?.data?.find(
                (item: any) => item?.message?.code === success_message_code
              )?.data[0]?.data_model
            }
            record={{
              ...record,
              list_items:
                actionPlanData?.data?.find(
                  (item: any) => item?.message?.code === "action_plan"
                )?.data || [],
            }}
            records={records}
            action={action}
            children={children}
            focused_item={focused_item}
          ></ActionInputForm>
        )}
      </div>
    </>
  );
};

export default PlanWrapper;

export const ActionStepsActionInputForm: React.FC<
  ActionStepsActionInputFormProps
> = ({
  action_steps,
  name,
  children,
  nested_component,
  action_icon,
  success_message_code,
  exclude_components,
}: ActionStepsActionInputFormProps) => {
  let state = {
    action_steps,
  };
  const { data, isLoading, error } = useFetchActionStepsDataByState(state);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error fetching action step data {JSON.stringify(error)}</div>;
  }
  return (
    <>
      {/* <div>{JSON.stringify(action_steps)}</div> */}
      {data?.data && (
        <ActionInputForm
          data_model={
            data?.data?.find(
              (item: any) => item?.message?.code === success_message_code
            )?.data[0]?.data_model
          }
          // record={record}
          execlude_components={exclude_components}
          name={name}
          children={children}
          nested_component={nested_component}
          // records={records}
          // action_icon={action_icon}
          // setExpandedRecordIds={setExpandedRecordIds}
        ></ActionInputForm>
      )}
    </>
  );
};
