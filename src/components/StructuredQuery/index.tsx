import MonacoEditor from "@components/MonacoEditor";
import { useQueryClient } from "@tanstack/react-query";
import { Accordion, Button, Textarea } from "@mantine/core";
// import { useDisclosure } from "@mantine/hooks";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
// import { IconMathFunction } from "@tabler/icons-react";
import _, { set } from "lodash";
import { useAppStore } from "src/store";
// import { v4 as uuidv4 } from "uuid";

export function StructuredQuery() {
  // create a state object called fieldDataMappings
  // this object will be used to store the data fetched from the backend
  // let fieldDataMappings = {};
  // const queryClient = useQueryClient();
  const {
    setActiveStructuredQuery,
    activeStructuredQuery,
    setActiveQueryGraph,
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

  const generateRequestData = (request_params: any) => {
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
    let queryData = {};
    if ((request_params.name = "generate_query_graph")) {
      queryData = {
        global_variables: {},
        include_execution_orders: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            tool: "generate_query_graph",
            tool_arguments: {
              query: request_params.values.query,
            },
          },
        ],
      };
    }

    if ((request_params.name = "update_structured_query")) {
      queryData = {
        global_variables: {},
        include_execution_orders: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            tool: "update",
            tool_arguments: {
              ids: [activeSession?.id],
              config: "surrealdb_catchmytask",
              resource: "sessions",
              values: {
                structured_query: {
                  content: request_params.values.query,
                  type: "text",
                  language: "sql",
                },
              },
            },
          },
        ],
      };
    }
    // const activeActionRequestData = _.merge(
    //   {},
    //   queryData || {}
    //   // activeAction || {},
    //   // activeActionFormatted || {}
    // );
    // return activeActionRequestData;
    return queryData;
  };

  const handleSubmit = (e: any) => {
    // set the active structured query
    setActiveStructuredQuery(values.query);
    // const activeActionRequestData = _.merge(
    //   {},
    //   queryData || {}
    //   // activeAction || {},
    //   // activeActionFormatted || {}
    // );
    // save the values to the backend
    mutate(
      {
        url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/catch`,
        method: "post",
        values: generateRequestData({
          name: "update_structured_query",
          values: values,
        }),
        // successNotification: (data, values) => {
        //   // console.log("successNotification", data);
        //   // invalidate query
        //   // invalidate this so that the query graph is retriggered
        //   // queryClient.invalidateQueries([activeViewItem?.id]); // invalidate the active view query to retrigger refresh of values

        //   return {
        //     message: `successfully executed.`,
        //     description: "Success with no errors",
        //     type: "success",
        //   };
        // },
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
          // queryClient.invalidateQueries(["execute-query-graph-key"]);
        },
      }
    );

    // console.log("values", values);
    // -> GENERATE QUERY GRAPH AND THE INVALIDATE THE queries that are dependent on the query graph
    // let generatedRequestData = generateRequestData(values);
    // console.log("generatedRequestData", generatedRequestData);
    mutate(
      {
        url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/catch`,
        method: "post",
        // values: generateRequestData({
        //   values: values,
        // }),
        values: generateRequestData({
          name: "generate_query_graph",
          values: values,
        }),
        // successNotification: (data, values) => {
        //   // console.log("successNotification", data);
        //   // invalidate query
        //   // invalidate this so that the query graph is retriggered
        //   // queryClient.invalidateQueries([activeViewItem?.id]); // invalidate the active view query to retrigger refresh of values

        //   return {
        //     message: `successfully executed.`,
        //     description: "Success with no errors",
        //     type: "success",
        //   };
        // },
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
          setActiveQueryGraph(data?.data);
          // invalidate the queries that are dependent on the query graph
          // queryClient.invalidateQueries(["execute-query-graph-key"]);
        },
      }
    );
  };

  return (
    <>
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
            <Button resource="automations" size="xs" variant="light">
              Generate Query Graph
            </Button>
            <SaveButton
              {...saveButtonProps}
              className="flex-grow w-2/3"
              variant="filled"
              // leftIcon={<IconMathFunction size={16} />}
              leftIcon={false}
              disabled={mutationIsLoading}
            >
              Run
            </SaveButton>
          </div>
        )}
      >
        <MonacoEditor
          value={
            activeStructuredQuery || activeSession?.structured_query?.content
          }
          language={activeSession?.structured_query?.language}
          setFieldValue={setFieldValue}
        />
      </Create>
    </>
  );
}

export default StructuredQuery;
