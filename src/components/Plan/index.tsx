import {
  extractIdentifier,
  getComponentByResourceType,
  useFetchActionDataByName,
  useFetchActionStepDataByState,
  useFetchActionStepsDataByState,
  useFetchDataModelByState,
  useFetchQueryDataByState,
  useReadRecordByState,
} from "@components/Utils";
import { useAppStore, useTransientStore } from "src/store";
import { Accordion, Button, Title } from "@mantine/core";
// import { ActionControlFormWrapper } from "@components/ActionControlForm";
import type { FieldApi } from "@tanstack/react-form";
import { useForm } from "@tanstack/react-form";
// import { IconArrowsVertical } from "@tabler/icons-react";
import { Children, useEffect, useRef, useState } from "react";
import {
  PlanWrapperProps,
  ActionStepsActionInputFormProps,
  ComponentKey,
  DynamicFormProps,
  IIdentity,
} from "@components/interfaces";
import {
  BaseRecord,
  HttpError,
  useCustomMutation,
  useGetIdentity,
} from "@refinedev/core";
import config from "src/config";
import { debounce, update } from "lodash";
import { useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import MonacoEditor from "@components/MonacoEditor";
import ExternalSubmitButton from "@components/SubmitButton";
import { ActionInputForm } from "@components/ActionInput";

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>{field.state.meta.errors.join(",")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

// export default ActionInput;

export const PlanWrapper: React.FC<PlanWrapperProps> = ({
  query_name,
  name,
  execution_record,
  action_type,
  entity,
  record,
  record_query,
  exclude_components = [],
  children,
  nested_component,
  setExpandedRecordIds,
  success_message_code,
  invalidate_queries_on_submit_success,
  description,
  update_action_input_form_values_on_submit_success,
  endpoint,
  action_label,
  records,
  action,
  include_form_components,
  focused_item,
  read_record_mode,
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
            // record={
            //   read_record_mode
            //     ? recordData
            //     : recordData?.data?.find(
            //         (item: any) => item?.message?.code === record?.id
            //       )?.data[0]
            // }
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
