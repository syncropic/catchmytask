import ActionControlForm from "@components/ActionControlForm";
import { IResourceComponentsProps } from "@refinedev/core";
import { useAppStore } from "src/store";

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  const { activeSession, activeActionOption, activeRecord } = useAppStore();

  return (
    <>
      {activeSession?.name && <div>Session: {activeSession?.name}</div>}
      {activeRecord?.id ||
        (activeRecord?.flight_pnr && (
          <div>Record: {activeRecord?.id || activeRecord?.flight_pnr}</div>
        ))}
      {activeActionOption && (
        <>
          Action: {activeActionOption?.display_name}
          <ActionControlForm
            activeSession={activeSession}
            activeActionOption={activeActionOption}
            activeRecords={[activeRecord]}
          ></ActionControlForm>
        </>
      )}
    </>
  );
};
export default PageCreate;
