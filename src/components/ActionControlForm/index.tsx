import { useFetchActionDataByName } from "@components/Utils";
import ActionControlForm from "./ActionControlForm";
import DynamicForm from "./DynamicForm";

interface ActionControlFormWrapperProps {
  action_type?: string;
  entity?: string;
  record?: any;
}

export const ActionControlFormWrapper: React.FC<
  ActionControlFormWrapperProps
> = ({
  record,
  action_type,
  entity,
}) => {
  let state = {
    action_type: action_type,
    entity: entity,
  };
  const {
    data: actionData,
    isLoading: actionDataIsLoading,
    error: actionDataError,
  } = useFetchActionDataByName(state);
  // const {
  //   data: activeActionView,
  //   isLoading: isLoadingView,
  //   isError: isErrorView,
  // } = useOne<IViewItem, HttpError>({
  //   resource: "views",
  //   id: `${activeActionActiveView?.id}`,
  // });

  // const {
  //   activeSession,
  //   activeAction,
  //   activeRecord,
  //   activeViewItem,
  //   setActiveActionView,
  //   activeResultsSection,
  //   activeQueryGraph,
  // } = useAppStore();
  // const queryClient = useQueryClient();
  // // Provide the type when calling getQueryData
  // const queryData = queryClient.getQueryData<QueryDataType>([
  //   "execute-query-graph-key",
  //   activeQueryGraph,
  // ]);

  // const defaultViewData = queryClient.getQueryData<QueryDataType>([
  //   "useFetchViewById_views:⟨018fff37-21c0-707f-b7f0-928c4c9412b5⟩",
  // ]);

  // // read field configurations from the query data

  // let field_configurations: FieldConfiguration[] = [];
  // // if (activeResultsSection?.name === "main_query") {
  // //   field_configurations =
  // //     queryData?.data[0]["main_query"]["field_configurations"] || [];
  // // } else {
  // //   field_configurations =
  // //     queryData?.data[0]["ctes"][activeResultsSection?.name][
  // //       "field_configurations"
  // //     ] || [];
  // // }

  // // console.log("queryData", queryData?.data);
  // // // use effect to set active action view if activeActionActiveView changes
  // // useEffect(() => {
  // //   setActiveActionView(activeActionView?.data);
  // // }, [activeActionView]);
  // // if (isLoadingView) return <div>Loading...</div>;
  // // if (isErrorView) return <div>Error: {JSON.stringify(activeActionView)}</div>;
  // // if (!activeSession) return <div>No active session selected</div>;
  // if (!activeAction) return <div>No active action selected</div>;
  // // get form field values by order of preference
  // // get the values from the action named ovalues on the record or the record itself in that order

  // // enrich it with display_component and display_name where missing ues the typescriptToDisplayComponent map
  // // enrich it with display_component and display_name where missing, using the typescriptToDisplayComponent map
  // // map data_prop_query to public_data_mapping with the field name as the key
  // // field_configurations = field_configurations?.map((field: any) => {
  // //   return {
  // //     ...field,
  // //     display_component:
  // //       field.display_component ||
  // //       typescriptToDisplayComponent[field.data_type] ||
  // //       "TextInput",
  // //     display_name: field.display_name || field.field_name,
  // //     placeholder: field.placeholder || field.field_name,
  // //     data_prop_query:
  // //       field.field_name in public_data_mapping
  // //         ? public_data_mapping[field?.field_name]
  // //         : field.data_prop_query,
  // //   };
  // // });
  // // // custom map some field name to some display component
  // // let customFieldMapping: { [key: string]: string } = {
  // //   service_id: "Select",
  // //   service: "Select",
  // // };
  // // // map the customFieldMapping to the field_configurations
  // // field_configurations = field_configurations?.map((field: any) => {
  // //   return {
  // //     ...field,
  // //     display_component:
  // //       field.display_component ||
  // //       customFieldMapping[field.field_name] ||
  // //       "TextInput",
  // //   };
  // // });
  // let view_field_configurations =
  //   defaultViewData?.data[0]?.field_configurations;

  // let field_configurations_with_defaults = field_configurations.map(
  //   (field: FieldConfiguration) => {
  //     // find the field in view_field_configurations by name
  //     // const view_field = view_field_configurations.find(
  //     //   (view_field: any) => view_field.name
  //     // );
  //     // console.log("view_field", view_field);
  //     // console.log(
  //     //   "found field in view_field_configurations",
  //     //   view_field_configurations.find((item: any) => (item.name = field.name))
  //     // );
  //     let found_field = view_field_configurations.find(
  //       (item: any) => item.name === field.name
  //     );
  //     // console.log("field", field);
  //     // console.log("found_field", found_field);
  //     return {
  //       ...found_field, // default
  //       ...field, // data
  //       // user view configurations override default configurations
  //       // visible: field.visible || true,
  //     };
  //   }
  // );

  // // filter items where visible_on_create is true from the field_configurations
  // let create_field_configurations = field_configurations_with_defaults.filter(
  //   (field: FieldConfiguration) => field.visible_on_create
  // );

  // // field_configurations = field_configurations?.map((field: any) => {
  // //   const customFieldMapping: { [key: string]: string } = {
  // //     service_id: "Select",
  // //     service: "Select",
  // //     created_datetime: "TextInput",
  // //     updated_datetime: "TextInput",
  // //   };

  // //   return {
  // //     ...field,
  // //     display_component:
  // //       customFieldMapping[field.field_name] || // Prioritize customFieldMapping
  // //       typescriptToDisplayComponent[field.data_type] ||
  // //       field.display_component || // Fallback to the existing display_component if none found
  // //       "TextInput",
  // //     display_name: field.display_name || field.field_name,
  // //     placeholder: field.placeholder || field.field_name,
  // //     data_prop_query:
  // //       field.field_name in public_data_mapping
  // //         ? public_data_mapping[field.field_name]
  // //         : field.data_prop_query,
  // //   };
  // // });

  // const actionFormFieldValues = extractFields(
  //   activeRecord?.[activeAction?.name] || activeRecord || {},
  //   // activeActionView?.data?.field_configurations ||
  //   //   activeViewItem?.fields_configuration ||
  //   //   activeViewItem?.view?.[0]?.fields_configuration ||
  //   field_configurations || []
  // );

  // console.log("actionFormFieldValues", actionFormFieldValues);
  if (actionDataError)
    return <div>Error: {JSON.stringify(actionDataError)}</div>;
  if (actionDataIsLoading) return <div>Loading...</div>;

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
      {/* <div>{JSON.stringify(actionData)}</div> */}
      {/* <div>{JSON.stringify(field_configurations)}</div> */}
      {/* <div>{JSON.stringify(actionFormFieldValues)}</div> */}
      {/* <div>action input</div>
      {JSON.stringify(
        actionData?.data?.find(
          (item: any) => item?.message?.code === "query_success_results"
        )?.data
      )} */}
      {actionData?.data && (
        <ActionControlForm
          data_model={
            actionData?.data?.find(
              (item: any) => item?.message?.code === "query_success_results"
            )?.data[0]?.data_model
          }
          record={record}
          // actionFormFieldValues={[]}
        ></ActionControlForm>
      )}
    </div>
  );
};
