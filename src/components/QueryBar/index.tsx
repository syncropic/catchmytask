import MonacoEditor from "@components/MonacoEditor";
import {
  componentMapping,
  extractIdentifier,
  getComponentByResourceType,
  replacePlaceholdersInObject,
} from "@components/Utils";
import { useQueryClient } from "@tanstack/react-query";
// import ViewActionHistory from "@components/ViewActionHistory";
import {
  CompleteActionComponentProps,
  ComponentKey,
  FieldConfiguration,
  IIdentity,
  IView,
} from "@components/interfaces";
import { Accordion, Button, Modal, TextInput, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { IconMathFunction, IconSearch } from "@tabler/icons-react";
import _, { set } from "lodash";
import CreateAutomation from "pages/automations/create";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { v4 as uuidv4 } from "uuid";
import config from "src/config";

export function QueryBar() {
  // create a state object called fieldDataMappings
  // this object will be used to store the data fetched from the backend
  // let fieldDataMappings = {};
  // const queryClient = useQueryClient();
  const {
    activeViewItem,
    // activeRecord,
    // selectedItems,
    activeField,
    setActiveField,
    focusedFields,
    setFocusedFields,
    // activeApplication,
    activeSession,
  } = useAppStore();
  // console.log("actionFormFieldValues", actionFormFieldValues);
  // let activeRecordId = activeRecords[0]?.id;
  const [openedAutomation, { open: openAutomation, close: closeAutomation }] =
    useDisclosure(false);
  const [openedChat, { open: openChat, close: closeChat }] =
    useDisclosure(false);
  const { data: identity } = useGetIdentity<IIdentity>();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
  } = useCustomMutation();
  const queryClient = useQueryClient();
  const actionFormFieldValues = {
    query: activeSession?.structured_query?.content,
  };
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
      ...actionFormFieldValues,
    },
    refineCoreProps: {},
  });
  const [opened, { open, close }] = useDisclosure(false);

  // useEffect(() => {
  //   reset();

  //   // Step 1: Reset form with only 'author' and 'author_email'
  //   // const resetValues = {
  //   //   author: identity?.email,
  //   //   author_email: identity?.email,
  //   // };

  //   const resetValues = {
  //     task_id: uuidv4(),
  //   };

  //   // Reinitialize form with base values plus dynamic actionFormFieldValues
  //   Object.entries({
  //     ...resetValues,
  //     ...actionFormFieldValues,
  //   }).forEach(([key, value]) => {
  //     setFieldValue(key, value);
  //   });
  //   // console.log("actionFormFieldValues", actionFormFieldValues);
  // }, [actionFormFieldValues, identity?.email]);

  // useEffect when selectedItems changes set the field item called selectedItems
  // useEffect(() => {
  //   if (selectedItems) {
  //     setFieldValue("selected_items", selectedItems[activeViewItem?.id]);
  //   }
  // }, [selectedItems]);

  const generateRequestData = (values: any) => {
    // console.log("values", values);
    // console.log("activeViewItem", activeViewItem);
    // console.log("activeRecord", activeRecord);
    // Merge the activeAction with activeActionFormatted, with activeActionFormatted taking precedence
    // let activeActionFormatted = {
    //   active_query: {
    //     ...(activeViewItem?.active_query || {}),
    //     record_identifier: extractIdentifier(activeRecord),
    //   },
    //   input_values: {
    //     ...values,
    //     selected_items: selectedItems[activeViewItem?.id], // pass this to the backend for bulk operations
    //     active_record: activeRecord, // pass this to the backend as well for downstream operations
    //     active_application: activeApplication, // pass this to the backend as well for downstream operations
    //     active_session: activeSession, // pass this to the
    //   },
    //   task_input: {
    //     ...replacePlaceholdersInObject(
    //       activeAction?.task_input || {},
    //       values || {}
    //     ),
    //   },
    //   task: {
    //     ...replacePlaceholdersInObject(activeAction?.task || {}, values || {}),
    //   },
    // };
    const queryData = {
      global_variables: {},
      include_execution_orders: [1],
      action_steps: [
        {
          id: "1",
          execution_order: 1,
          tool: "query",
          tool_arguments: {
            query: values.query,
          },
        },
      ],
    };
    const activeActionRequestData = _.merge(
      {},
      queryData || {}
      // activeAction || {},
      // activeActionFormatted || {}
    );
    return activeActionRequestData;
  };

  const handleSubmit = (e: any) => {
    // let generatedRequestData = generateRequestData(values);
    // console.log("generatedRequestData", generatedRequestData);
    mutate({
      url: `${config.API_URL}/catch`,
      method: "post",
      values: generateRequestData(values),
      successNotification: (data, values) => {
        // console.log("successNotification", data);
        // invalidate query

        // queryClient.invalidateQueries(["list_action_history_1"]);
        // queryClient.invalidateQueries([activeViewItem?.id]); // invalidate the active view query to retrigger refresh of values

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

  interface FunctionMappings {
    handleFileSelection: (value: any) => void;
    handleFileHandlerSelection: (value: any) => void;
    handleFocus: (value: any) => void;
  }

  // // using a type guard to check if the key is in the functionMappings object
  // function isFunctionMappingKey(key: any): key is keyof FunctionMappings {
  //   return key in functionMappings;
  // }

  // get data triggered by eventHandlers + utilize reactquery for caching instead of adding another value to zustand, keep that clean

  const { data, isLoading, error } = useCustom({
    url: `${config.API_URL}/query`,
    method: "post",
    config: {
      payload: {
        // Here, ensure that you're constructing your payload correctly without circular references
        // For example, use the focusedFieldName directly if it's part of the payload
        function_arguments: activeField?.data_prop_query,
      },
    },
    queryOptions: {
      queryKey: [`field_data_for_${activeField?.field_name}`], // simply change the query key to trigger call for that field
      // enabled: !!focusedField?.field_name, // This query runs only if focusedFieldName is not null
      // there is a field and it is not in focusedFields // should dynamically create new query keys for each field
      // enabled:
      //   !!activeField?.field_name && !focusedFields?.[activeField?.field_name],
      // enabled:
      // !!isTouched(activeField?.field_name) && !focusedFields?.[activeField?.field_name],
      enabled:
        activeField?.field_name && !focusedFields?.[activeField?.field_name]
          ? true
          : false, // as long as there is a activefield with field name, run the query
    },
    successNotification: (data, values) => {
      // console.log("successNotification", data);
      // data is the response from the query
      setFocusedFields({
        ...focusedFields,
        [activeField?.field_name]: {
          ...activeField,
          data: data?.data,
        },
      }); // Reset focused field after successful query
      return {
        message: `successfully retrieved ${activeField?.field_name}s.`,
        description: "Success with no errors",
        type: "success",
      };
    },
  });

  // This event handler now expects a field name (or some simple identifier) as an argument
  const handleFocus = (event: any, field: any) => {
    // const fieldIsTouched = isTouched(field.field_name);
    // console.log("fieldIsTouched", fieldIsTouched);
    // console.log("field", field);
    // set the activeField
    setActiveField(field);

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

  // const functionMappings = {
  //   handleFileSelection: handleFileSelection,
  //   handleFileHandlerSelection: handleFileHandlerSelection,
  //   handleFocus: handleFocus,
  //   // add more mappings as needed
  // };

  return (
    <>
      {/* QueryBar: results set query bar - bar with global search and filters for a result set i.e a single resolution of the query graph */}
      <div className="flex gap-3">
        <Modal opened={opened} onClose={close} title="Sort & Filter">
          <div>natural language query</div>
          <div>structured query</div>
          <div>building blocks query</div>
          <div>and group</div>
          <div>or group</div>
          <div>
            filter
            <div>left</div>
            <div>operator</div>
            <div>right</div>
          </div>
          <div>
            sort
            <div>column</div>
            <div>direction</div>
          </div>
          <div>----</div>
          <div>search fields</div>
          <div>draggable fields grid</div>
        </Modal>
        <TextInput
          placeholder="Search"
          leftSection={<IconSearch size={16} />}
          size="xs"
        />
        <Button size="xs" onClick={open}>
          Sort
        </Button>
        <Button size="xs" onClick={open}>
          Filter
        </Button>
      </div>
    </>
  );
}

export default QueryBar;
