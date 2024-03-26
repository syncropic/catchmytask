import { Button } from "@mantine/core";
import { useCustomMutation } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";

const RowActions = ({ record }: { record: any }) => {
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();
  const queryClient = useQueryClient();

  const handleSubmit = (e: any) => {
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute-action-step`,
      method: "post",
      values: record,
      successNotification: (data, values) => {
        queryClient.invalidateQueries(["list_action_history_1"]);

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
      onClick={() => handleSubmit(record)}
    >
      Run
    </Button>
  );
};

export default RowActions;
