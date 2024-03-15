import ActionControlForm from "@components/ActionControlForm";
import { HttpError, IResourceComponentsProps, useOne } from "@refinedev/core";
import { useAppStore } from "src/store";
import { Text } from "@mantine/core";
import { IAction } from "@components/interfaces";

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  const {
    activeSession,
    activeActionId,
    activeRecord,
    activeViewItem,
    activeApplication,
  } = useAppStore();

  const {
    data: activeActionData,
    isLoading: isLoadingActiveAction,
    isError: isErrorActiveAction,
    error: errorActiveAction,
  } = useOne<IAction, HttpError>({
    resource: "action_options",
    id: activeActionId?.id,
  });

  const activeAction = activeActionData?.data;

  // const extractedFields = extractFields(
  //   activeRecords[0] || {},
  //   activeActionOption?.field_configurations || []
  // );

  // console.log("activeAction", activeAction);

  return (
    <>
      {/* <div>make this a breadcrumb</div> */}
      {activeApplication?.name && (
        <>
          <div className="flex">
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
          <Text>
            {activeRecord?.id ||
              activeRecord?.flight_pnr ||
              activeRecord?.trip_id ||
              activeRecord?.test_id}
          </Text>
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
          <ActionControlForm
            activeSession={activeSession}
            activeAction={activeAction}
            activeRecords={[activeRecord]}
          ></ActionControlForm>
        </>
      )}
    </>
  );
};
export default PageCreate;
