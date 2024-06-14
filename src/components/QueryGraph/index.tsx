import MonacoEditor from "@components/MonacoEditor";
// import {
//   componentMapping,
//   extractIdentifier,
//   getComponentByResourceType,
//   replacePlaceholdersInObject,
// } from "@components/Utils";
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
// import { useDisclosure } from "@mantine/hooks";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
// import { IconMathFunction } from "@tabler/icons-react";
import _, { set } from "lodash";
// import CreateAutomation from "pages/automations/create";
// import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
// import { v4 as uuidv4 } from "uuid";

export function QueryGraph() {
  // create a state object called fieldDataMappings
  // this object will be used to store the data fetched from the backend
  // let fieldDataMappings = {};
  // const queryClient = useQueryClient();
  const { activeQueryGraph } = useAppStore();
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
    // query: activeSession?.structured_query?.content,
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

  const generateRequestData = (values: any) => {
    const queryData = {
      global_variables: {},
      include_execution_orders: [1],
      action_steps: [
        {
          id: "1",
          execution_order: 1,
          tool: "generate_query_graph",
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
    // set the active structured query
    // setActiveStructuredQuery(values.query);
    // -> GENERATE QUERY GRAPH AND THE INVALIDATE THE queries that are dependent on the query graph
    // let generatedRequestData = generateRequestData(values);
    // console.log("generatedRequestData", generatedRequestData);
    mutate(
      {
        url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/catch`,
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
      },
      {
        onError: (error, variables, context) => {
          // An error occurred!
          console.log("error", error);
        },
        onSuccess: (data, variables, context) => {
          // Let's celebrate!
          // console.log("succeess", "query graph generated successfully");
          // set active query graph as the response
          // setActiveQueryGraph(data?.data);
          // invalidate the queries that are dependent on the query graph
        },
      }
    );
  };

  return (
    <>
      {/* <div>{JSON.stringify(activeQueryGraph)}</div> */}
      <Create
        // isLoading={formLoading}
        // isLoading={mutationIsLoading}
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
            <Button
              resource="automations"
              size="xs"
              variant="light"
              disabled={true}
            >
              Generate Recommendations Graph
            </Button>
            <SaveButton
              {...saveButtonProps}
              className="flex-grow w-2/3"
              variant="filled"
              // leftIcon={<IconMathFunction size={16} />}
              leftIcon={false}
              // disabled={mutationIsLoading}
              disabled={true}
            >
              Run
            </SaveButton>
          </div>
        )}
      >
        <MonacoEditor
          value={activeQueryGraph}
          language="json"
          setFieldValue={setFieldValue}
        />
      </Create>
    </>
  );
}

export default QueryGraph;
