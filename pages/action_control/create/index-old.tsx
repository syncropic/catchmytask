import ActionControlForm from "@components/ActionControlForm";
import {
  extractActiveActionDefaultValues,
  extractFields,
  extractIdentifier,
  replacePlaceholdersInObject,
  useFetchActionById,
} from "@components/Utils";
import { Text } from "@mantine/core";
import { IResourceComponentsProps, useCustom } from "@refinedev/core";
import { useEffect } from "react";
import { useAppStore } from "src/store";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Reveal from "@components/Reveal";
import MonacoEditor from "@components/MonacoEditor";

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
      // console.log("activeAction", activeAction);
      const activeRecordActiveActionViewId =
        activeRecord[activeAction?.name]["view_id"];
      // console.log(
      //   "activeRecordActiveActionViewId",
      //   activeRecordActiveActionViewId
      // );
    }
  }, [activeAction, activeRecord]);

  const {
    data: actionViewData,
    isLoading: isLoadingActionView,
    error: errorActionView,
  } = useCustom({
    url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
    method: "post",
    config: {
      payload: {
        // Here, ensure that you're constructing your payload correctly without circular references
        // For example, use the focusedFieldName directly if it's part of the payload
        function_arguments: {
          query: "SELECT * FROM views:⟨018ed478-7e8d-7172-b4cd-8172031304c3⟩",
          query_language: "surrealql",
          credentials: "surrealdb_catchmytask",
        },
      },
    },
    queryOptions: {
      queryKey: [`action_view_views:⟨018ed478-7e8d-7172-b4cd-8172031304c3⟩`], // simply change the query key to trigger call for that field
      // enabled: !!focusedField?.field_name, // This query runs only if focusedFieldName is not null
      // there is a field and it is not in focusedFields // should dynamically create new query keys for each field
      // enabled:
      //   !!activeField?.field_name && !focusedFields?.[activeField?.field_name],
      // enabled:
      // !!isTouched(activeField?.field_name) && !focusedFields?.[activeField?.field_name],
      enabled: true,
      // enabled:
      //   activeField?.field_name && !focusedFields?.[activeField?.field_name]
      //     ? true
      //     : false, // as long as there is a activefield with field name, run the query
    },
    successNotification: (data, values) => {
      // console.log("successNotification", data);
      // data is the response from the query
      // setFocusedFields({
      //   ...focusedFields,
      //   [activeField?.field_name]: {
      //     ...activeField,
      //     data: data?.data,
      //   },
      // }); // Reset focused field after successful query
      return {
        message: `successfully retrieved views:⟨018ed478-7e8d-7172-b4cd-8172031304c3⟩.`,
        description: "Success with no errors",
        type: "success",
      };
    },
  });
  console.log("actionViewData", actionViewData?.data[0]);

  // if activeAction?.name == "clone" the activeRecordToClone = {record: activeRecord}
  let activeRecordValues =
    activeAction?.name === "clone" ? { record: activeRecord } : activeRecord;
  // console.log("activeRecordToClone", activeRecordToClone);
  // get fieldDefaultValues from activeAction.field_configurations
  // let activeActionDefaultValues = extractActiveActionDefaultValues(
  //   activeAction?.field_configurations || []
  // );
  let activeActionDefaultValues = extractActiveActionDefaultValues(
    actionViewData?.data[0]?.field_configurations || []
  );
  // console.log("activeActionDefaultValues", activeActionDefaultValues);
  // format and replace the placeholders in default values
  let activeActionDefaultValuesFormatted = {
    ...replacePlaceholdersInObject(
      activeActionDefaultValues || {},
      {
        active_user_email: "david.wanjala@snowstormtech.com",
        // current_datetime: new Date().toISOString(),
      } || {}
    ),
  };
  // console.log(
  //   "activeActionDefaultValuesFormatted",
  //   activeActionDefaultValuesFormatted
  // );
  // if activeActionDefaultValuesFormatted has at least one key then activeActionDefaultValuesFormatted = activeActionDefaultValuesFormatted else it is equal to null
  activeActionDefaultValuesFormatted =
    Object.keys(activeActionDefaultValuesFormatted).length > 0
      ? activeActionDefaultValuesFormatted
      : null;
  // console.log(
  //   "activeActionDefaultValuesFormatted",
  //   activeActionDefaultValuesFormatted
  // );

  // const actionFormFieldValues = extractFields(
  //   activeRecordValues || activeActionDefaultValues || {},
  //   activeAction?.field_configurations || []
  // );
  // add both default values and activeactionrecordvalues to the form fields
  // const actionFormFieldValues = extractFields(
  //   { ...activeActionDefaultValuesFormatted, ...activeRecordValues } ||
  //     activeRecordValues,
  //   activeAction?.field_configurations || []
  // );
  const actionFormFieldValues = extractFields(
    { ...activeActionDefaultValuesFormatted, ...activeRecordValues } ||
      activeRecordValues,
    actionViewData?.data[0]?.field_configurations || []
  );
  // console.log("activeRecordValues", activeRecordValues);
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
                {/* <div>{JSON.stringify(activeRecord)}</div> */}
                <ActionControlForm
                  activeSession={activeSession}
                  activeActionView={actionViewData?.data[0]}
                  activeAction={activeAction}
                  activeRecords={[activeRecord]}
                  actionFormFieldValues={actionFormFieldValues}
                ></ActionControlForm>
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
