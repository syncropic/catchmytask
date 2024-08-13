// import MonacoEditor from "@components/MonacoEditor";
// import Reveal from "@components/Reveal";
// import { extractIdentifier } from "@components/Utils";
import { useAppStore } from "src/store";
// import { Text } from "@mantine/core";
import { ActionControlFormWrapper } from "@components/ActionControlForm";

import { useState } from "react";
import { Tabs } from "@mantine/core";
import ActionStepResults from "@components/ActionStepResults";

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
          <Tabs defaultValue="create" orientation="vertical">
            <Tabs.List>
              <Tabs.Tab value="create">create</Tabs.Tab>
              <Tabs.Tab value="run">run</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="create">
              <div className="p-3">
                <ActionControlFormWrapper
                  record={record}
                  action_type="write"
                  entity="action_step"
                ></ActionControlFormWrapper>
              </div>
            </Tabs.Panel>
            <Tabs.Panel value="run">
              <ActionStepResults record={record}></ActionStepResults>
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

          {/* <ActionControlFormWrapper
            record={record}
            action_type="write"
            entity="action_step"
          ></ActionControlFormWrapper> */}
        </>
      )}
    </>
  );
}

export default ActionStepEditor;
