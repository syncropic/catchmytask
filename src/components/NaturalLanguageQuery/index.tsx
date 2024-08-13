import { useQueryClient } from "@tanstack/react-query";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import config from "src/config";
import Editor from "@components/TiptapEditor";

export function NaturalLanguageQuery() {
  const {
    activeApplication,
    activeSession,
    setNaturalLanguageQueryFormValues,
  } = useAppStore();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
    data: mutationData,
  } = useCustomMutation();
  const queryClient = useQueryClient();
  const actionFormFieldValues = {
    content_json: activeSession?.natural_language_query?.content_json || "",
    content_text: activeSession?.natural_language_query?.content_text || "",
    type: activeSession?.natural_language_query?.type || "json",
  };
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    setValues,
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

  useEffect(() => {
    // Update the form state in the global store whenever it changes
    setNaturalLanguageQueryFormValues(values);
  }, [values, setNaturalLanguageQueryFormValues]);

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

    // );
  };

  return (
    <>
      {/* {" "}
      {JSON.stringify(values)} */}
      <Editor
        value={
          // activeStructuredQuery ||
          activeSession?.natural_language_query?.content?.[0] || ""
        }
        setFieldValue={setFieldValue}
        setValues={setValues}
        handleSubmit={handleSubmit}
      ></Editor>
    </>
  );
}

export default NaturalLanguageQuery;
