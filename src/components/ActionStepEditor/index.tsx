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
  return (
    <>
      {/* <div>{JSON.stringify(record)}</div> */}
      {/* <div>action step editor</div> */}
      {/* <div>{JSON.stringify(record)}</div> */}
      {/* <div>predetermined forms or dynamic prompting from agent for action input / feedback. some llm prompts or clicking on buttons or selecting actions updates this section */}
      {/* render any pydantic model form */}

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
            <Tabs.Tab value="context" leftSection={<IconTextScan2 size={12} />}>
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
                exclude_components={["input_mode"]}
                record={record}
                success_message_code="action_input_data_model_schema"
                update_action_input_form_values_on_submit_success={true}
                action_label="Save"
                endpoint="write"
              ></ActionInputWrapper>
            </div>
            {/* <div>create</div> */}
          </Tabs.Panel>
          <Tabs.Panel value="context">
            {/* <div>context</div> */}
            {/* {JSON.stringify(actionStepData)} */}
            <MonacoEditor
              language="json"
              value={record}
              // options={{
              //   readOnly: true,
              // }}
            />
          </Tabs.Panel>
          <Tabs.Panel value="results">
            <MonacoEditor
              language="json"
              value={record}
              // options={{
              //   readOnly: true,
              // }}
            />
          </Tabs.Panel>
        </Tabs>
      </>
    </>
  );
}

export default ActionStepEditor;
