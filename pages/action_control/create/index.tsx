import ActionControlForm from "@components/ActionControlForm";
import {
  extractFields,
  extractIdentifier,
  useFetchActionById,
} from "@components/Utils";
import { Text } from "@mantine/core";
import { IResourceComponentsProps } from "@refinedev/core";
import { useEffect } from "react";
import { useAppStore } from "src/store";

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  const {
    activeSession,
    activeAction,
    setActiveAction,
    activeRecord,
    activeViewItem,
    activeApplication,
    setActiveActionId,
    activeActionId,
  } = useAppStore();

  // const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  const { action, isLoading, error } = useFetchActionById(
    activeActionId?.id || ""
  );

  useEffect(() => {
    if (action) {
      setActiveAction(action);
    }
    // Handle other dependencies like record and view_item here
    // if (record) {
    //   setActiveRecord(record);
    // }

    // if (view_item) {
    //   setActiveViewItem(view_item);
    // }
    // activateSection("rightSection");
  }, [activeActionId, action]);
  // if activeAction?.name == "clone" the activeRecordToClone = {record: activeRecord}
  let activeRecordValues =
    activeAction?.name === "clone" ? { record: activeRecord } : activeRecord;
  // console.log("activeRecordToClone", activeRecordToClone);

  const actionFormFieldValues = extractFields(
    activeRecordValues || {},
    activeAction?.field_configurations || []
  );
  // console.log("actionFormFieldValues", actionFormFieldValues);
  if (actionFormFieldValues.length === 0) {
    return (
      <div>
        <Text>No action fields to display</Text>
      </div>
    );
  }

  return (
    <>
      {/* <div>make this a breadcrumb</div> */}
      {activeApplication?.name && (
        <>
          <div className="flex gap-1">
            <Text fw={500}>Application:</Text>{" "}
            <Text>{activeApplication?.name}</Text>
          </div>
        </>
      )}
      {activeSession?.name && (
        <>
          <div className="flex gap-1">
            <Text fw={500}>Session:</Text> <Text>{activeSession?.name}</Text>
          </div>
        </>
      )}
      {activeRecord && (
        <div className="flex gap-1">
          <Text fw={500}>Record:</Text>
          <Text>{JSON.stringify(extractIdentifier(activeRecord))}</Text>
        </div>
      )}
      {activeViewItem?.display_name && (
        <div className="flex gap-1">
          <Text fw={500}>View: </Text>
          <Text>{activeViewItem?.display_name}</Text>
        </div>
      )}

      {activeAction && (
        <>
          <div className="flex gap-1">
            <Text fw={500}>Action: </Text>
            <Text>{activeAction?.display_name}</Text>
          </div>
          {/* <div>{JSON.stringify(activeRecord)}</div> */}
          <ActionControlForm
            activeSession={activeSession}
            activeAction={activeAction}
            activeRecords={[activeRecord]}
            actionFormFieldValues={actionFormFieldValues}
          ></ActionControlForm>
        </>
      )}
    </>
  );
};
export default PageCreate;
