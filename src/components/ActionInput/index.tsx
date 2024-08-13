import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import { extractIdentifier } from "@components/Utils";
import { useAppStore } from "src/store";
import { Text } from "@mantine/core";
import { ActionControlFormWrapper } from "@components/ActionControlForm";

export function ActionInput() {
  const {
    // activeSession,
    activeAction,
    // activeRecord,
    // activeApplication,
    // activeResultsSection,
  } = useAppStore();

  return (
    <>
      {/* <div>predetermined forms or dynamic prompting from agent for action input / feedback. some llm prompts or clicking on buttons or selecting actions updates this section */}
      {/* render any pydantic model form */}
      {activeAction && (
        <>
          <ActionControlFormWrapper
            action_name={activeAction.name}
          ></ActionControlFormWrapper>
        </>
      )}
    </>
  );
}

export default ActionInput;
