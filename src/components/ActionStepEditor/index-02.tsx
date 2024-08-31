import { useAppStore } from "src/store";
import { Tabs } from "@mantine/core";
import {
  IconEdit,
  IconForms,
  IconMathFunction,
  IconTable,
  IconTextScan2,
} from "@tabler/icons-react";
import classes from "./Demo.module.css";
import ActionInputWrapper from "@components/ActionInput";
import { useFetchActionStepDataByState } from "@components/Utils";
import DataDisplay from "@components/DataDisplay";
import MonacoEditor from "@components/MonacoEditor";

interface ActionStepEditorProps {
  entity?: string;
  record?: any;
  setExpandedRecordIds?: (ids: string[]) => void;
  invalidate_queries_on_submit_success?: string[];
  // types?: string[];
  // state?: any;
  // read_write_mode?: string;
  // ui?: Record<string, any>;
}

export function ActionStepEditor({
  entity = "action_steps",
  record,
  setExpandedRecordIds,
  invalidate_queries_on_submit_success,
}: // types,
// read_write_mode = "read",
// ui = {},
ActionStepEditorProps) {
  const {
    // activeSession,
    activeAction,
  } = useAppStore();
  const { action_input_form_values } = useAppStore();
  let action_step_record =
    record ||
    action_input_form_values[`task_b79aaba2-a0d1-4fa7-9b68-0baebbd1b321`];
  // console.log("record", record);
  let state = {
    // global_variables: global_variables,
    action_steps: [action_step_record],
    // include_action_steps: [record?.execution_order || 0],
  };
  const {
    data: actionStepData,
    isLoading: actionStepDataIsLoading,
    error: actionStepDataError,
  } = useFetchActionStepDataByState(state);
  if (actionStepDataIsLoading) {
    return <div>Loading...</div>;
  }
  if (actionStepDataError) {
    return (
      <div>
        Error fetching action step data {JSON.stringify(actionStepDataError)}
      </div>
    );
  }
  let data_fields = [
    {
      name: "id",
      accessor: "id",
    },
  ];
  let nested_item = false;

  return (
    <>
      {/* <div>{JSON.stringify(record)}</div> */}
      {/* <div>action step editor</div> */}
      {/* <div>{JSON.stringify(record)}</div> */}
      {/* <div>predetermined forms or dynamic prompting from agent for action input / feedback. some llm prompts or clicking on buttons or selecting actions updates this section */}
      {/* render any pydantic model form */}
      {activeAction && (
        <>
          <Tabs
            defaultValue="results"
            orientation="horizontal"
            variant="unstyled"
            classNames={classes}
          >
            <Tabs.List>
              <Tabs.Tab value="create" leftSection={<IconForms size={12} />}>
                Action Input
              </Tabs.Tab>
              <Tabs.Tab
                value="context"
                leftSection={<IconTextScan2 size={12} />}
              >
                Context
              </Tabs.Tab>
              <Tabs.Tab value="results" leftSection={<IconTable size={12} />}>
                Results
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="create">
              <div className="p-3">
                <ActionInputWrapper
                  name="action_step"
                  query_name="data_model"
                  record={record}
                  exclude_components={["submit_button", "input_mode"]}
                ></ActionInputWrapper>
              </div>
              {/* <div>create</div> */}
            </Tabs.Panel>
            <Tabs.Panel value="context">
              {/* <div>context</div> */}
              {/* {JSON.stringify(actionStepData)} */}
              <MonacoEditor
                language="json"
                value={actionStepData}
                // options={{
                //   readOnly: true,
                // }}
              />
            </Tabs.Panel>
            <Tabs.Panel value="results">
              {/* <div>results</div>
              {JSON.stringify(actionStepData)} */}
              <DataDisplay
                data_items={
                  nested_item
                    ? actionStepData?.data?.find(
                        (item: any) =>
                          item?.message?.code === "query_success_results"
                      )?.data?.[0]?.[nested_item] || []
                    : actionStepData?.data?.find(
                        (item: any) =>
                          item?.message?.code === "query_success_results"
                      )?.data || []
                }
                data_fields={
                  (
                    actionStepData?.data?.find(
                      (item: any) =>
                        item?.message?.code === "query_success_results"
                    )?.data_fields || []
                  ).map((item: any) => ({
                    name: item?.name,
                    accessor: item?.name,
                  })) ||
                  data_fields ||
                  []
                }
                read_write_mode={"read"}
                isLoadingDataItems={actionStepDataIsLoading}
                resource_group={record?.execution_id}
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
                  "actions",
                ]}
                ui={{}}
              ></DataDisplay>
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </>
  );
}

export default ActionStepEditor;
