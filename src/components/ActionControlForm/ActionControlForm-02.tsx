import MonacoEditor from "@components/MonacoEditor";
import {
  componentMapping,
  extractFields,
  extractIdentifier,
  getComponentByResourceType,
  replacePlaceholdersInObject,
  useFetchActionDataByName,
} from "@components/Utils";
import { useQueryClient } from "@tanstack/react-query";
import ViewActionHistory from "@components/ViewActionHistory";
import {
  CompleteActionComponentProps,
  ComponentKey,
  FieldConfiguration,
  FieldData,
  IIdentity,
  IView,
  QueryDataType,
} from "@components/interfaces";
import { Accordion, Button, Textarea } from "@mantine/core";
// import { useDisclosure } from "@mantine/hooks";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { IconMathFunction } from "@tabler/icons-react";
// import _, { set } from "lodash";
// import CreateAutomation from "pages/automations/create";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { v4 as uuidv4 } from "uuid";
import { Combobox } from "@components/Combobox";
import { inputs } from "@data/index";
import config from "src/config";

interface DataModel {
  data_model: {
    author_id: string;
    created_datetime: string;
    description: string;
    entity_type: string;
    id: string;
    name: string;
    schema: {
      properties: {
        [key: string]: {
          component: string;
          description: string;
          placeholder?: string;
          size?: string;
          title: string;
          type: string;
          readOnly?: boolean;
          format?: string;
        };
      };
      required: string[];
      title: string;
      type: string;
    };
    updated_datetime: string;
  };
}

interface DynamicFormProps {
  data_model: DataModel["data_model"];
}

const ActionControlForm: React.FC<DynamicFormProps> = ({ data_model }) => {
  const { schema } = data_model;

  // create a state object called fieldDataMappings
  // this object will be used to store the data fetched from the backend
  // let fieldDataMappings = {};
  const {
    activeViewItem,
    // activeRecord,
    // selectedItems,
    // activeField,
    // setActiveField,
    // focusedFields,
    // setFocusedFields,
    activeApplication,
    activeAction,
    activeSession,
  } = useAppStore();
  // console.log("actionFormFieldValues", actionFormFieldValues);
  // let activeRecordId = activeRecords[0]?.id;
  // const [openedAutomation, { open: openAutomation, close: closeAutomation }] =
  //   useDisclosure(false);
  // const [openedChat, { open: openChat, close: closeChat }] =
  //   useDisclosure(false);
  // const { data: identity } = useGetIdentity<IIdentity>();
  // maintained touchedFields to keep track of fields that have been touched in useState
  const [touchedFields, setTouchedFields] = useState<string[]>([]);
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
  } = useCustomMutation();
  const [inputAsvalue, setInputAsValue] = useState("");
  const queryClient = useQueryClient();
  // const queryData = queryClient.getQueryData(["field_data_for_service"]);
  // // console.log("queryData", queryData?.data);
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
    reset,
    isTouched,
  } = useForm({
    initialValues: {
      // ...actionFormFieldValues,
    },
    refineCoreProps: {},
  });

  useEffect(() => {
    reset();

    // Step 1: Reset form with only 'author' and 'author_email'
    // const resetValues = {
    //   author: identity?.email,
    //   author_email: identity?.email,
    // };

    const resetValues = {
      id: uuidv4(),
    };

    // Reinitialize form with base values plus dynamic actionFormFieldValues
    Object.entries({
      ...resetValues,
      ...{},
    }).forEach(([key, value]) => {
      setFieldValue(key, value);
    });
    // console.log("actionFormFieldValues", actionFormFieldValues);
  }, [data_model]);

  // useEffect when selectedItems changes set the field item called selectedItems
  // useEffect(() => {
  //   if (selectedItems) {
  //     setFieldValue("selected_items", selectedItems[activeViewItem?.id]);
  //   }
  // }, [selectedItems]);

  // const generateRequestData = (values: any) => {
  //   // console.log("values", values);
  //   // console.log("activeViewItem", activeViewItem);
  //   // console.log("activeRecord", activeRecord);
  //   // Merge the activeAction with activeActionFormatted, with activeActionFormatted taking precedence
  //   let activeActionFormatted = {
  //     active_query: {
  //       ...(activeViewItem?.active_query || {}),
  //       record_identifier: extractIdentifier(activeRecord),
  //     },
  //     input_values: {
  //       ...values,
  //       selected_items: selectedItems[activeViewItem?.id], // pass this to the backend for bulk operations
  //       active_record: activeRecord, // pass this to the backend as well for downstream operations
  //       active_application: activeApplication, // pass this to the backend as well for downstream operations
  //       active_session: activeSession, // pass this to the
  //     },
  //     task_input: {
  //       ...replacePlaceholdersInObject(
  //         activeAction?.task_input || {},
  //         values || {}
  //       ),
  //     },
  //     task: {
  //       ...replacePlaceholdersInObject(activeAction?.task || {}, values || {}),
  //     },
  //   };
  //   const activeActionRequestData = _.merge(
  //     {},
  //     activeAction || {},
  //     activeActionFormatted || {}
  //   );
  //   return activeActionRequestData;
  // };

  const handleSubmit = (e: any) => {
    // let generatedRequestData = generateRequestData(values);
    // console.log("generatedRequestData", generatedRequestData);
    mutate({
      url: `${config.API_URL}/catch-action`,
      method: "post",
      // values: generateRequestData(values),
      values: {
        action: {
          ...activeAction,
        },
        input_values: values,
        credential: "surrealdb_catchmytask",
        data_model: data_model,
        application: {
          ...activeApplication,
        },
        session: {
          ...activeSession,
        },
      },
      successNotification: (data, values) => {
        // console.log("successNotification", data);
        // invalidate query

        queryClient.invalidateQueries(["list_action_history_1"]);
        queryClient.invalidateQueries([activeViewItem?.id]); // invalidate the active view query to retrigger refresh of values

        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        // console.log("successNotification", data?.response.status);
        // console.log("errorNotification values", values);
        return {
          message: `${data?.response.status} : ${
            data?.response.statusText
          } : ${JSON.stringify(data?.response.data)}`,
          description: "Error",
          type: "error",
        };
      },
    });
  };

  // const viewComponent = (activeViewItem: IView, activeRecord: any) => {
  //   // console.log("activeViewItem", activeViewItem);
  //   // return "";
  //   if (!activeViewItem) {
  //     return null;
  //   }
  //   if (!activeViewItem.resource_type) {
  //     return null;
  //   }
  //   const Component = componentMapping[activeViewItem.resource_type];
  //   return <Component item={activeRecord} />;
  // };
  // if (!activeAction) {
  //   return <div>No active action selected</div>;
  // }

  // let activeFieldConfigurationsObject = activeViewItem ? activeSession
  //   ? activeAction
  //   : activeRecord;

  // let activeFieldConfigurationsObject =
  //   activeActionView ?? activeSession ?? activeAction ?? activeRecord;

  // let activeFieldConfigurationsObject = activeAction;

  // const actionFieldConfigurations =
  //   activeActionView?.field_configurations ||
  //   // activeViewItem?.fields_configuration ||
  //   // activeViewItem?.view?.[0]?.fields_configuration ||
  //   activeAction?.field_configurations ||
  //   [];
  // console.log("actionFieldConfigurations", actionFieldConfigurations);

  // FormFieldValues = extractFields(
  //   activeRecord || {},
  //   activeViewItem?.fields_configuration ||
  //     activeViewItem?.view?.[0]?.fields_configuration ||
  //     activeAction?.field_configurations ||
  //     []
  // );

  // console.log(
  //   "activeFieldConfigurationsObject",
  //   activeFieldConfigurationsObject
  // );

  // sometimes we want to use the fields configuration on the activeRecord i.e activeSession instead of the activeRecord
  // handleFileSelection
  const handleFileSelection = (value: any) => {
    console.log("value", value);

    // const file = e.target.files[0];
    // console.log("file", file);
    // const reader = new FileReader();
    // reader.onload = (event) => {
    //   // console.log("event.target.result", event.target.result);
    //   setFieldValue("file", event.target.result);
    // };
    // reader.readAsDataURL(file);
  };
  const handleFileHandlerSelection = (value: any) => {
    console.log("value", value);
    // const file = e.target.files[0];
    // console.log("file", file);
    // const reader = new FileReader();
    // reader.onload = (event) => {
    //   // console.log("event.target.result", event.target.result);
    //   setFieldValue("file", event.target.result);
    // };
    // reader.readAsDataURL(file);
  };

  // interface FunctionMappings {
  //   handleFileSelection: (value: any) => void;
  //   handleFileHandlerSelection: (value: any) => void;
  //   handleFocus: (value: any) => void;
  // }

  // // using a type guard to check if the key is in the functionMappings object
  // function isFunctionMappingKey(key: any): key is keyof FunctionMappings {
  //   return key in functionMappings;
  // }

  // get data triggered by eventHandlers + utilize reactquery for caching instead of adding another value to zustand, keep that clean

  // This event handler now expects a field name (or some simple identifier) as an argument
  const handleFocus = (event: any, field: any) => {
    console.log("field", field);
    console.log("event", event);
    // add it to the touchedFields
    setTouchedFields([...touchedFields, field.field_name]);
    const fieldIsTouched = isTouched(field.field_name);
    // console.log("fieldIsTouched", fieldIsTouched);
    // console.log("field", field);
    // set the activeField
    // setActiveField(field);

    // console.log("fieldIsTouched", fieldIsTouched);
    // if (fieldIsTouched) {
    //   // If the field is already touched, don't refetch the data
    //   return;
    // }
    // // console.log("fieldIsTouched", fieldIsTouched);
    // setFocusedFields({
    //   ...focusedFields,
    //   [field.field_name]: field,
    // }); // Set the name of the focused field
  };

  const functionMappings = {
    handleFileSelection: handleFileSelection,
    handleFileHandlerSelection: handleFileHandlerSelection,
    handleFocus: handleFocus,
    // add more mappings as needed
  };
  // interface DataItem {
  //   id: number;
  //   name: string;
  // }

  // interface FieldData {
  //   data?: DataItem[];
  // }

  return (
    <>
      <Create
        // isLoading={formLoading}
        isLoading={mutationIsLoading}
        saveButtonProps={{
          disabled: saveButtonProps?.disabled,
          onClick: handleSubmit,
          size: "xs",
        }}
        breadcrumb={false}
        title={false}
        goBack={false}
        footerButtons={({ saveButtonProps }) => (
          <div className="flex w-full gap-4">
            {/* <SaveButton
            {...saveButtonProps}
            className="flex-grow w-2/3"
            variant="filled"
            leftIcon={<IconMathFunction size={16} />}
            disabled={mutationIsLoading}
          >
            Run
          </SaveButton> */}
            <SaveButton
              {...saveButtonProps}
              className="flex-grow w-2/3"
              variant="filled"
              leftIcon={<IconMathFunction size={16} />}
              disabled={mutationIsLoading}
            >
              {activeAction?.display_name || "Run"}
            </SaveButton>
            {/* <Button
              resource="automations"
              size="xs"
              variant="light"
              onClick={() => {
                if (openedChat) {
                  closeChat();
                } else {
                  openChat();
                }
              }}
            >
              {openedChat ? "Close Chat" : "Chat"}
            </Button> */}
            {/* <Button
              resource="automations"
              size="xs"
              variant="light"
              onClick={() => {
                if (openedAutomation) {
                  closeAutomation();
                } else {
                  openAutomation();
                }
              }}
            >
              {openedAutomation ? "Close Automation" : "Automate"}
            </Button> */}
          </div>
        )}
      >
        <div className="flex justify-end">
          {" "}
          <Combobox
            data_items={inputs}
            resource="input"
            value={inputAsvalue}
            setValue={setInputAsValue}
          ></Combobox>
        </div>
        {(inputAsvalue === "" || inputAsvalue === "form") && (
          <div>
            {" "}
            {data_model &&
              Object.keys(schema.properties).map((key) => {
                const Component = getComponentByResourceType(
                  schema.properties[key]?.component as ComponentKey
                );
                let data_query_key = `field_data_for_${schema.properties[key]?.title}`;
                // let fieldData: FieldData = queryClient.getQueryData([data_query_key]) || {data: []};
                // const fieldData =
                //   queryClient.getQueryData<FieldData>([data_query_key]) || {};
                // console.log("fieldData", fieldData);
                // console.log("field", field);
                // if there is a data_prop_query in a field, retrieve the data before rendering or on focus?// add on_focus to the field configuration
                // improve later to allow onfocus on search etc
                return (
                  <>
                    <div key={schema.properties[key]?.title} className="mb-4">
                      <Component
                        {...getInputProps(
                          schema.properties[key]?.title.toLowerCase()
                        )}
                        // {...field?.props}
                        disabled={schema.properties[key]?.readOnly}
                        label={schema.properties[key]?.title}
                        placeholder={schema.properties[key]?.placeholder}
                        searchable={true}
                        // {...(field.on_change &&
                        // isFunctionMappingKey(field.on_change)
                        //   ? { onChange: functionMappings[field.on_change] }
                        //   : {})}
                        // {...(field?.data_prop_query && {
                        //   onFocus: (e: any) => handleFocus(e, field),
                        //   data: (fieldData?.data || []).map(
                        //     (data_item: any) => ({
                        //       value: data_item["id"],
                        //       label: data_item["name"],
                        //     })
                        //   ),
                        // })}
                      />
                    </div>
                    {/* {field?.data_prop_query && (
                      <FieldDataQuery
                        field={field}
                        touchedFields={touchedFields}
                      />
                    )} */}
                  </>
                );
              })}
          </div>
        )}
        {inputAsvalue === "json" && (
          <MonacoEditor value={values} language="json" height="100vh" />
        )}
        {inputAsvalue === "structured_query" && (
          <MonacoEditor
            value={`${activeAction?.name} ${JSON.stringify(values)}`}
            language="json"
            height="100vh"
          />
        )}
        {inputAsvalue === "natural_language" && (
          <MonacoEditor
            value={`${activeAction?.name} ${JSON.stringify(values)}`}
            language="json"
            height="100vh"
          />
        )}
      </Create>
      <div className="h-[400px]"></div>
      {/* for spacing and making the action buttons visible */}
    </>
  );
};

export default ActionControlForm;

// component to make query request for field data
const FieldDataQuery = ({
  field,
  touchedFields,
}: {
  field: FieldConfiguration;
  touchedFields: string[];
}) => {
  const { activeField } = useAppStore();

  const { data, isLoading, error } = useCustom({
    url: `${config.API_URL}/query`,
    method: "post",
    config: {
      payload: {
        // Here, ensure that you're constructing your payload correctly without circular references
        // For example, use the focusedFieldName directly if it's part of the payload
        function_arguments: {
          credentials: "surrealdb_catchmytask",
          query: field?.data_prop_query,
          query_language: "surrealdb",
        },
      },
    },
    queryOptions: {
      queryKey: [`field_data_for_${field?.field_name}`], // simply change the query key to trigger call for that field
      // enabled: !!focusedField?.field_name, // This query runs only if focusedFieldName is not null
      // there is a field and it is not in focusedFields // should dynamically create new query keys for each field
      // enabled:
      //   !!activeField?.field_name && !focusedFields?.[activeField?.field_name],
      // enabled:
      // !!isTouched(activeField?.field_name) && !focusedFields?.[activeField?.field_name],
      // enabled:
      //   activeField?.field_name && !focusedFields?.[activeField?.field_name]
      //     ? true
      //     : false, // as long as there is a activefield with field name, run the query
      enabled: touchedFields.includes(field?.name),
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
        message: `successfully retrieved ${activeField?.field_name}s.`,
        description: "Success with no errors",
        type: "success",
      };
    },
  });
  return (
    <div>
      div field data queries:{" "}
      {JSON.stringify(touchedFields.includes(field?.name))}
    </div>
  );
};
