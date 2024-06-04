import ActionControlForm from "@components/ActionControlForm";
import {
  extractActiveActionDefaultValues,
  extractFields,
  extractIdentifier,
  replacePlaceholdersInObject,
  useFetchActionById,
} from "@components/Utils";
import { Text } from "@mantine/core";
import {
  HttpError,
  IResourceComponentsProps,
  useCustom,
  useOne,
} from "@refinedev/core";
import { useEffect } from "react";
import { useAppStore } from "src/store";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Reveal from "@components/Reveal";
import MonacoEditor from "@components/MonacoEditor";
import { IViewItem } from "@components/interfaces";

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  const {
    activeSession,
    activeAction,
    setActiveAction,
    activeRecord,
    activeViewItem,
    activeApplication,
    activeActionId,
    selectedItems,
    setActiveActionActiveView,
    activeActionActiveView,
    activeDataset,
  } = useAppStore();

  // 1) FETCH ACTIVE ACTION RECORD
  const { action, isLoading, error } = useFetchActionById(
    activeActionId?.id || ""
  );

  // 1.1 SET ACTIVE ACTION RECORD ONCE FETCHED or when activeActionId changes
  useEffect(() => {
    if (action) {
      setActiveAction(action);
    }
  }, [activeActionId, action]);
  // activeRecord activeAction view_id
  // 3) TRIGGER FETCH OF ACTIVE RECORD ACTIVE ACTION ACTION VIEW
  useEffect(() => {
    if (activeAction && activeRecord) {
      // innermost declaration/override
      let activeRecordActiveActionViewId =
        activeRecord?.[activeAction?.name]?.["view_id"] ||
        activeDataset?.[activeAction?.name]?.["view_id"] ||
        activeSession?.[activeAction?.name]?.["view_id"] ||
        activeViewItem?.view_id;

      // console.log(
      //   "activeRecordActiveActionViewId",
      //   activeRecordActiveActionViewId
      // );

      if (activeRecordActiveActionViewId) {
        setActiveActionActiveView({ id: activeRecordActiveActionViewId });
      }
      // if (!activeRecordActiveActionViewId) {
      //   setActiveActionActiveView({ id: activeAction?.view_id });
      // }
      // console.log(
      //   "activeRecordActiveActionViewId",
      //   activeRecordActiveActionViewId
      // );
      // console.log("activeAction", activeAction);
      // const activeRecordActiveActionViewId =
      //   activeRecord[activeAction?.name]["view_id"];
      // // console.log(
      // //   "activeRecordActiveActionViewId",
      // //   activeRecordActiveActionViewId
      // // );
    }
  }, [activeAction, activeRecord]);

  // // console.log("actionViewData", actionViewData?.data[0]);

  // // if activeAction?.name == "clone" the activeRecordToClone = {record: activeRecord}
  // let activeRecordValues =
  //   activeAction?.name === "clone" ? { record: activeRecord } : activeRecord;
  // // console.log("activeRecordToClone", activeRecordToClone);
  // // get fieldDefaultValues from activeAction.field_configurations
  // // let activeActionDefaultValues = extractActiveActionDefaultValues(
  // //   activeAction?.field_configurations || []
  // // );
  // let activeActionDefaultValues = extractActiveActionDefaultValues(
  //   actionViewData?.data[0]?.field_configurations || []
  // );
  // // console.log("activeActionDefaultValues", activeActionDefaultValues);
  // // format and replace the placeholders in default values
  // let activeActionDefaultValuesFormatted = {
  //   ...replacePlaceholdersInObject(
  //     activeActionDefaultValues || {},
  //     {
  //       active_user_email: "david.wanjala@snowstormtech.com",
  //       // current_datetime: new Date().toISOString(),
  //     } || {}
  //   ),
  // };

  // // if activeActionDefaultValuesFormatted has at least one key then activeActionDefaultValuesFormatted = activeActionDefaultValuesFormatted else it is equal to null
  // activeActionDefaultValuesFormatted =
  //   Object.keys(activeActionDefaultValuesFormatted).length > 0
  //     ? activeActionDefaultValuesFormatted
  //     : null;

  // const actionFormFieldValues = extractFields(
  //   { ...activeActionDefaultValuesFormatted, ...activeRecordValues } ||
  //     activeRecordValues,
  //   actionViewData?.data[0]?.field_configurations || []
  // );
  // // console.log("activeRecordValues", activeRecordValues);
  // // console.log("actionFormFieldValues", actionFormFieldValues);
  // if (actionFormFieldValues.length === 0) {
  //   return (
  //     <div>
  //       <Text>No action fields to display</Text>
  //     </div>
  //   );
  // }

  return (
    <>
      <PanelGroup direction="vertical">
        <Panel defaultSize={30}>
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
                <Text fw={500}>Session:</Text>{" "}
                <Text>{activeSession?.name}</Text>
              </div>
            </>
          )}
          {activeRecord && (
            <div className="flex gap-1">
              <Text fw={500}>Record:</Text>

              <Reveal
                resource={
                  <Text fw={500}>
                    {JSON.stringify(extractIdentifier(activeRecord))}
                  </Text>
                }
                value="value"
              >
                <MonacoEditor value={activeRecord}></MonacoEditor>
              </Reveal>
            </div>
          )}
          {activeViewItem?.display_name && (
            <div className="flex gap-1">
              <Text fw={500}>View: </Text>
              <Text>{activeViewItem?.display_name}</Text>
            </div>
          )}
          {activeAction?.display_name && (
            <div className="flex gap-1">
              <Text fw={500}>Action:</Text>

              <Reveal
                resource={<Text fw={500}>{activeAction?.display_name}</Text>}
                value="value"
              >
                <MonacoEditor value={activeAction}></MonacoEditor>
              </Reveal>
            </div>
          )}
          {activeAction?.display_name && (
            <Reveal
              resource={
                <Text fw={500}>
                  Selected Items: {selectedItems[activeViewItem?.id]?.length}
                </Text>
              }
              value="value"
            >
              <MonacoEditor
                value={selectedItems[activeViewItem?.id]}
              ></MonacoEditor>
            </Reveal>
          )}
        </Panel>
        <PanelResizeHandle className="h-1 bg-gray-500" id="middle" />
        <Panel>
          <div
            className="overflow-auto h-screen"
            style={{ height: "calc(100vh - 0px)" }}
          >
            {activeAction && (
              <>
                <ActionControlFormWrapper
                  activeActionActiveView={activeActionActiveView}
                ></ActionControlFormWrapper>
              </>
            )}
          </div>
          {/* empty space for scrolling to action controls */}
        </Panel>
      </PanelGroup>
    </>
  );
};
export default PageCreate;

// // simple react component that returns hello world
// const ActionControlFormWrapper: React.FC = (activeActionActiveView) => {
//   return <div>{JSON.stringify(activeActionActiveView)}</div>;
// };

interface ActionControlFormWrapperProps {
  activeActionActiveView: any; // Replace 'any' with the specific type as necessary
}

const ActionControlFormWrapper: React.FC<ActionControlFormWrapperProps> = ({
  activeActionActiveView,
}) => {
  const {
    data: activeActionView,
    isLoading: isLoadingView,
    isError: isErrorView,
  } = useOne<IViewItem, HttpError>({
    resource: "views",
    id: `${activeActionActiveView?.id}`,
  });

  const {
    activeSession,
    activeAction,
    activeRecord,
    activeViewItem,
    setActiveActionView,
  } = useAppStore();
  // use effect to set active action view if activeActionActiveView changes
  useEffect(() => {
    setActiveActionView(activeActionView?.data);
  }, [activeActionView]);
  if (isLoadingView) return <div>Loading...</div>;
  if (isErrorView) return <div>Error: {JSON.stringify(activeActionView)}</div>;
  // if (!activeSession) return <div>No active session selected</div>;
  if (!activeAction) return <div>No active action selected</div>;
  // get form field values by order of preference
  // get the values from the action named ovalues on the record or the record itself in that order
  const actionFormFieldValues = extractFields(
    activeRecord?.[activeAction?.name] || activeRecord || {},
    // activeActionView?.data?.field_configurations ||
    //   activeViewItem?.fields_configuration ||
    //   activeViewItem?.view?.[0]?.fields_configuration ||
    activeAction?.field_configurations || []
  );

  // console.log("actionFormFieldValues", actionFormFieldValues);

  return (
    // <>{JSON.stringify(activeActionView?.data?.field_configurations)}</>
    // <div>hello</div>
    <ActionControlForm
      activeSession={activeSession}
      activeActionView={activeActionView?.data}
      activeAction={activeAction}
      activeRecords={[activeRecord]}
      actionFormFieldValues={actionFormFieldValues}
    ></ActionControlForm>
  );
};
