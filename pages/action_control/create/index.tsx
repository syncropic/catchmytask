import ActionControlForm from "@components/ActionControlForm";
import { useQueryClient } from "@tanstack/react-query";
import {
  extractActiveActionDefaultValues,
  extractFields,
  extractIdentifier,
  replacePlaceholdersInObject,
  typescriptToDisplayComponent,
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
import {
  FieldConfiguration,
  IViewItem,
  QueryDataType,
} from "@components/interfaces";
import { public_data_mapping } from "@data/index";

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
    activeResultsSection,
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
          {/* <div>make this an enhanced breadcrumb // window into the state</div> */}
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
                <Reveal
                  target={<Text>{activeSession?.name}</Text>}
                  trigger="click"
                >
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
                <Reveal
                  target={<Text>{activeAction?.name}</Text>}
                  trigger="click"
                >
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
          {/* {activeViewItem?.display_name && (
            <div className="flex gap-1">
              <Text fw={500}>View: </Text>
              <Text>{activeViewItem?.display_name}</Text>
            </div>
          )} */}
          {/* {activeAction?.display_name && (
            <div className="flex gap-1">
              <Text fw={500}>Action:</Text>

              <Reveal
                resource={<Text fw={500}>{activeAction?.display_name}</Text>}
                value="value"
              >
                <MonacoEditor value={activeAction}></MonacoEditor>
              </Reveal>
            </div>
          )} */}
          {/* {activeAction?.display_name && (
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
          )} */}
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
                // activeActionActiveView={activeActionActiveView}
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
  // activeActionActiveView: any; // Replace 'any' with the specific type as necessary
}

const ActionControlFormWrapper: React.FC<ActionControlFormWrapperProps> = (
  {
    // activeActionActiveView,
  }
) => {
  // const {
  //   data: activeActionView,
  //   isLoading: isLoadingView,
  //   isError: isErrorView,
  // } = useOne<IViewItem, HttpError>({
  //   resource: "views",
  //   id: `${activeActionActiveView?.id}`,
  // });

  const {
    activeSession,
    activeAction,
    activeRecord,
    activeViewItem,
    setActiveActionView,
    activeResultsSection,
    activeQueryGraph,
  } = useAppStore();
  const queryClient = useQueryClient();
  // Provide the type when calling getQueryData
  const queryData = queryClient.getQueryData<QueryDataType>([
    "execute-query-graph-key",
    activeQueryGraph,
  ]);

  const defaultViewData = queryClient.getQueryData<QueryDataType>([
    "useFetchViewById_views:⟨018fff37-21c0-707f-b7f0-928c4c9412b5⟩",
  ]);

  // read field configurations from the query data

  let field_configurations = [];
  // if (activeResultsSection?.name === "main_query") {
  //   field_configurations =
  //     queryData?.data[0]["main_query"]["field_configurations"] || [];
  // } else {
  //   field_configurations =
  //     queryData?.data[0]["ctes"][activeResultsSection?.name][
  //       "field_configurations"
  //     ] || [];
  // }

  // console.log("queryData", queryData?.data);
  // // use effect to set active action view if activeActionActiveView changes
  // useEffect(() => {
  //   setActiveActionView(activeActionView?.data);
  // }, [activeActionView]);
  // if (isLoadingView) return <div>Loading...</div>;
  // if (isErrorView) return <div>Error: {JSON.stringify(activeActionView)}</div>;
  // if (!activeSession) return <div>No active session selected</div>;
  if (!activeAction) return <div>No active action selected</div>;
  // get form field values by order of preference
  // get the values from the action named ovalues on the record or the record itself in that order

  // enrich it with display_component and display_name where missing ues the typescriptToDisplayComponent map
  // enrich it with display_component and display_name where missing, using the typescriptToDisplayComponent map
  // map data_prop_query to public_data_mapping with the field name as the key
  // field_configurations = field_configurations?.map((field: any) => {
  //   return {
  //     ...field,
  //     display_component:
  //       field.display_component ||
  //       typescriptToDisplayComponent[field.data_type] ||
  //       "TextInput",
  //     display_name: field.display_name || field.field_name,
  //     placeholder: field.placeholder || field.field_name,
  //     data_prop_query:
  //       field.field_name in public_data_mapping
  //         ? public_data_mapping[field?.field_name]
  //         : field.data_prop_query,
  //   };
  // });
  // // custom map some field name to some display component
  // let customFieldMapping: { [key: string]: string } = {
  //   service_id: "Select",
  //   service: "Select",
  // };
  // // map the customFieldMapping to the field_configurations
  // field_configurations = field_configurations?.map((field: any) => {
  //   return {
  //     ...field,
  //     display_component:
  //       field.display_component ||
  //       customFieldMapping[field.field_name] ||
  //       "TextInput",
  //   };
  // });
  let view_field_configurations =
    defaultViewData?.data[0]?.field_configurations;

  let field_configurations_with_defaults = field_configurations.map(
    (field: FieldConfiguration) => {
      // find the field in view_field_configurations by name
      // const view_field = view_field_configurations.find(
      //   (view_field: any) => view_field.name
      // );
      // console.log("view_field", view_field);
      // console.log(
      //   "found field in view_field_configurations",
      //   view_field_configurations.find((item: any) => (item.name = field.name))
      // );
      let found_field = view_field_configurations.find(
        (item: any) => item.name === field.name
      );
      // console.log("field", field);
      // console.log("found_field", found_field);
      return {
        ...found_field, // default
        ...field, // data
        // user view configurations override default configurations
        // visible: field.visible || true,
      };
    }
  );

  // filter items where visible_on_create is true from the field_configurations
  let create_field_configurations = field_configurations_with_defaults.filter(
    (field: FieldConfiguration) => field.visible_on_create
  );

  // field_configurations = field_configurations?.map((field: any) => {
  //   const customFieldMapping: { [key: string]: string } = {
  //     service_id: "Select",
  //     service: "Select",
  //     created_datetime: "TextInput",
  //     updated_datetime: "TextInput",
  //   };

  //   return {
  //     ...field,
  //     display_component:
  //       customFieldMapping[field.field_name] || // Prioritize customFieldMapping
  //       typescriptToDisplayComponent[field.data_type] ||
  //       field.display_component || // Fallback to the existing display_component if none found
  //       "TextInput",
  //     display_name: field.display_name || field.field_name,
  //     placeholder: field.placeholder || field.field_name,
  //     data_prop_query:
  //       field.field_name in public_data_mapping
  //         ? public_data_mapping[field.field_name]
  //         : field.data_prop_query,
  //   };
  // });

  const actionFormFieldValues = extractFields(
    activeRecord?.[activeAction?.name] || activeRecord || {},
    // activeActionView?.data?.field_configurations ||
    //   activeViewItem?.fields_configuration ||
    //   activeViewItem?.view?.[0]?.fields_configuration ||
    field_configurations || []
  );

  // console.log("actionFormFieldValues", actionFormFieldValues);

  return (
    // <>{JSON.stringify(activeActionView?.data?.field_configurations)}</>
    // <div>hello</div>
    // <ActionControlForm
    //   activeSession={activeSession}
    //   activeActionView={activeActionView?.data}
    //   activeAction={activeAction}
    //   activeRecords={[activeRecord]}
    //   actionFormFieldValues={actionFormFieldValues}
    // ></ActionControlForm>
    <div>
      {/* action control form inputs */}
      <div>{JSON.stringify(create_field_configurations)}</div>
      {/* <div>{JSON.stringify(field_configurations)}</div> */}
      {/* <div>{JSON.stringify(actionFormFieldValues)}</div> */}
      {/* <ActionControlForm
        actionFieldConfigurations={field_configurations}
        actionFormFieldValues={actionFormFieldValues}
      ></ActionControlForm> */}
    </div>
  );
};
