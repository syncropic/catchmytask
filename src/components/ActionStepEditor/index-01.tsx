// import MonacoEditor from "@components/MonacoEditor";
// import Reveal from "@components/Reveal";
// import { extractIdentifier } from "@components/Utils";
import { useAppStore } from "src/store";
// import { Text } from "@mantine/core";
import { ActionControlFormWrapper } from "@components/ActionControlForm";

import { useState } from "react";
import { Tabs } from "@mantine/core";
import ActionStepResults, {
  ActionStepResultsWrapper,
} from "@components/ActionStepResults";
import {
  IconEdit,
  IconForms,
  IconMathFunction,
  IconTable,
  IconTextScan2,
} from "@tabler/icons-react";
import classes from "./Demo.module.css";
import ActionInputWrapper from "@components/ActionInput";

interface ActionStepEditorProps {
  entity?: string;
  record?: any;
  // types?: string[];
  // state?: any;
  // read_write_mode?: string;
  // ui?: Record<string, any>;
}

export function ActionStepEditor({
  entity = "action_steps",
  record,
}: // types,
// read_write_mode = "read",
// ui = {},
ActionStepEditorProps) {
  const {
    // activeSession,
    activeAction,
    // activeRecord,
    // activeApplication,
    // activeResultsSection,
  } = useAppStore();
  // const [name, setName] = useState(initialData.name);
  // const [city, setCity] = useState(initialData.city);
  // const [state, setState] = useState(initialData.state);
  // const [streetAddress, setStreetAddress] = useState(initialData.streetAddress);
  // const [missionStatement, setMissionStatement] = useState(initialData.missionStatement);

  return (
    <>
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
                ></ActionInputWrapper>
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="context">
              <div>context</div>
            </Tabs.Panel>
            <Tabs.Panel value="results">
              <div>results</div>
              {/* <div>{JSON.stringify(record)}</div> */}
              {/* <ActionStepResultsWrapper
                record={record}
              ></ActionStepResultsWrapper> */}
              {/* <div>
                quick summary of action step inner workings - view only - pull
                up and run any action at any time, just through search
              </div>
              <div>
                action step and dependency mocking (dependency mocking
                techniques) or direct provision
              </div>
              <div>button to trigger action</div>
              <div>display of action results</div> */}
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </>
  );
}

export default ActionStepEditor;
