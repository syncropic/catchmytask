import React from "react";
import { Anchor, Button, Text } from "@mantine/core";
import { useAppStore } from "src/store";
import { useCustomMutation, useGo } from "@refinedev/core";
import { useInvalidate } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";

// import { queryClient } from "@components/Utils";

const RowActions = ({ record }: { record: any }) => {
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();
  const queryClient = useQueryClient();

  // const invalidate = useInvalidate();
  // const { activeApplication, setActiveSession } = useAppStore();
  // const go = useGo();
  // Check if the value is a valid URL. If not, return an empty fragment
  const handleSubmit = (e: any) => {
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute-action-step`,
      method: "post",
      values: record,
      successNotification: (data, values) => {
        queryClient.invalidateQueries([
          "default",
          "custom",
          "post",
          "http://localhost/query",
          {
            payload: {
              credentials: "surrealdb_catchmytask",
              query:
                "SELECT id AS action_step_id, in AS task_id, in.author AS author, in.name AS task_name, out AS function_id, out.name AS function_name, execution_order, name AS action_step_name, updated_at, created_at, status, results FROM execute WHERE in.name == 'update_dataset'",
              query_language: "surrealql",
            },
          },
        ]);

        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        console.log("errorNotification data", data);
        console.log("errorNotification values", values);
        return {
          message: `${data} : something went wrong when executing. ${data?.message}`,
          description: "Error",
          type: "error",
        };
      },
    });
  };
  if (!record) {
    return <></>;
  }

  return (
    <Button
      size="xs"
      variant="outline"
      color={record?.status === "complete" ? "green" : "blue"}
      onClick={() =>
        // handleRun(
        //   // executing_record && "request_object" in executing_record
        //   //   ? executing_record.request_object
        //   //   : null,
        //   record?.request_object,
        //   row.original,
        //   record
        // )
        handleSubmit(record)
      }
    >
      Run
    </Button>
  );
};

export default RowActions;
