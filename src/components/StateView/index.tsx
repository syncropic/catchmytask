import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import { extractIdentifier } from "@components/Utils";
import { useAppStore } from "src/store";
import { Text } from "@mantine/core";

export function StateView() {
  const {
    activeSession,
    activeAction,
    activeRecord,
    activeApplication,
    activeResultsSection,
  } = useAppStore();

  return (
    <>
      {/* <div>make this an enhanced breadcrumb // window into the state</div> */}
      {/* <div>state view</div> */}
      {activeApplication?.name && (
        <>
          <div className="flex gap-1">
            <Text fw={500}>activeApplication:</Text>{" "}
            <Reveal
              target={<Text>{activeApplication?.name}</Text>}
              trigger="click"
            >
              <MonacoEditor value={activeApplication}></MonacoEditor>
            </Reveal>
          </div>
        </>
      )}
      {activeSession?.name && (
        <>
          <div className="flex gap-1">
            <Text fw={500}>activeSession:</Text>{" "}
            <Reveal target={<Text>{activeSession?.name}</Text>} trigger="click">
              <MonacoEditor value={activeSession}></MonacoEditor>
            </Reveal>
          </div>
        </>
      )}
      {activeResultsSection?.name && (
        <>
          <div className="flex gap-1">
            <Text fw={500}>activeResultsSection:</Text>{" "}
            <Reveal
              target={<Text>{activeResultsSection?.name}</Text>}
              trigger="click"
            >
              <MonacoEditor value={activeResultsSection}></MonacoEditor>
            </Reveal>
          </div>
        </>
      )}
      {activeAction?.name && (
        <>
          <div className="flex gap-1">
            <Text fw={500}>activeAction:</Text>{" "}
            <Reveal target={<Text>{activeAction?.name}</Text>} trigger="click">
              <MonacoEditor value={activeAction}></MonacoEditor>
            </Reveal>
          </div>
        </>
      )}
      {activeRecord && (
        <div className="flex gap-1">
          <Text fw={500}>activeRecord:</Text>{" "}
          <Reveal
            target={
              <Text>{JSON.stringify(extractIdentifier(activeRecord))}</Text>
            }
            trigger="click"
          >
            <MonacoEditor value={activeRecord}></MonacoEditor>
          </Reveal>
        </div>
      )}
    </>
  );
}

export default StateView;
