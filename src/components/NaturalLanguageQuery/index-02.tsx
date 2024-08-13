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
import { Accordion, Button, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
// import { IconMathFunction } from "@tabler/icons-react";
// import _, { set } from "lodash";
// import CreateAutomation from "pages/automations/create";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
// import { v4 as uuidv4 } from "uuid";
// import Editor from "@components/TiptapEditor";
import config from "src/config";
import Editor from "@components/TiptapEditor";
// this example loads the EditorState class from the ProseMirror state package
// import { EditorState } from '@tiptap/pm/state';

export function NaturalLanguageQuery() {
  // create a state object called fieldDataMappings
  // this object will be used to store the data fetched from the backend
  // let fieldDataMappings = {};
  // const queryClient = useQueryClient();
  const {
    // setActiveStructuredQuery,
    // activeStructuredQuery,
    // setActiveQueryGraph,
    activeApplication,
    activeSession,
  } = useAppStore();
  // console.log("actionFormFieldValues", actionFormFieldValues);
  // let activeRecordId = activeRecords[0]?.id;
  // const [openedAutomation, { open: openAutomation, close: closeAutomation }] =
  //   useDisclosure(false);
  // const [openedChat, { open: openChat, close: closeChat }] =
  //   useDisclosure(false);
  // const { data: identity } = useGetIdentity<IIdentity>();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
    data: mutationData,
  } = useCustomMutation();
  const queryClient = useQueryClient();
  const actionFormFieldValues = {
    content: activeSession?.natural_language_query?.content || "",
    // language:
    //   activeSession?.natural_language_query?.language || "natural_language",
    type: activeSession?.natural_language_query?.type || "json",
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

  const handleSubmit = (e: any) => {
    // console.log("values", values);
    // set the active structured query
    // setActiveStructuredQuery(values.query);
    mutate(
      {
        url: `${config.API_URL}/catch-nlp`,
        method: "post",
        values: {
          input_values: values,
          application: {
            ...activeApplication,
          },
          session: {
            ...activeSession,
          },
          // global_variables: {},
          // include_execution_orders: [1],
          // action_steps: [
          //   {
          //     id: "1",
          //     execution_order: 1,
          //     tool: "update",
          //     tool_arguments: {
          //       ids: [activeSession?.id],
          //       config: "surrealdb_catchmytask",
          //       resource: "sessions",
          //       values: {
          //         natural_language_query: {
          //           content: values.query,
          //           type: values.type,
          //           language: values.language,
          //         },
          //       },
          //     },
          //   },
          // ],
        },
        successNotification: (data, values) => {
          return {
            message: `successfully updated structured query.`,
            description: "successfully updated structured query.",
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
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
          console.log("error", error);
          return null;
        },
        onSuccess: (data, variables, context) => {
          // Let's celebrate!
          // console.log("succeess", "query graph generated successfully");
          // set active query graph as the response
          // setActiveQueryGraph(data?.data);
          // invalidate the queries that are dependent on the query graph
          // queryClient.invalidateQueries(["execute-query-graph-key"]);
        },
      }
    );

    // console.log("values", values);
    // -> GENERATE QUERY GRAPH AND THE INVALIDATE THE queries that are dependent on the query graph
    // let generatedRequestData = generateRequestData(values);
    // console.log("generatedRequestData", generatedRequestData);
    // mutate(
    //   {
    //     url: `${config.API_URL}/catch`,
    //     method: "post",
    //     values: {
    //       global_variables: {},
    //       include_execution_orders: [1],
    //       action_steps: [
    //         {
    //           id: "1",
    //           execution_order: 1,
    //           tool: "generate_completion",
    //           tool_arguments: {
    //             session_id: activeSession?.id,
    //             ids: [activeSession?.id],
    //             config: "surrealdb_catchmytask",
    //             resource: "messages",
    //             values: {
    //               natural_language_query: {
    //                 content: values.query,
    //                 type: values.type,
    //                 language: values.language,
    //               },
    //             },
    //           },
    //         },
    //       ],
    //     },
    //     successNotification: (data, values) => {
    //       // console.log("successNotification", data);
    //       // invalidate query
    //       // invalidate this so that the query graph is retriggered
    //       // queryClient.invalidateQueries([activeViewItem?.id]); // invalidate the active view query to retrigger refresh of values

    //       return {
    //         message: `successfully generated completion.`,
    //         description: "successfully generated completion",
    //         type: "success",
    //       };
    //     },
    //     errorNotification: (data, values) => {
    //       return {
    //         message: `${data?.response.status} : ${
    //           data?.response.statusText
    //         } : ${JSON.stringify(data?.response.data)}`,
    //         description: "Error",
    //         type: "error",
    //       };
    //     },
    //   },
    //   {
    //     onError: (error, variables, context) => {
    //       // An error occurred!
    //       console.log("error", error);
    //       return null;
    //     },
    //     onSuccess: (data, variables, context) => {
    //       console.log("succeess", "completion generated successfully");
    //       console.log("data", data);
    //       queryClient.invalidateQueries(["execute-query-graph-key"]);
    //       // Let's celebrate!
    //       // console.log("succeess", "query graph generated successfully");
    //       // set active query graph as the response
    //       // setActiveQueryGraph(data?.data);
    //       // invalidate the queries that are dependent on the query graph
    //       // queryClient.invalidateQueries(["execute-query-graph-key"]);
    //     },
    //   }
    // );
  };

  return (
    <Editor
      value={
        // activeStructuredQuery ||
        activeSession?.natural_language_query?.content?.[0] || ""
      }
      setFieldValue={setFieldValue}
      handleSubmit={handleSubmit}
    ></Editor>
  );
}

export default NaturalLanguageQuery;
