import {
  Button,
  LoadingOverlay,
  MultiSelect,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { Create, CreateButton, SaveButton, useForm } from "@refinedev/mantine";
import { format, parseISO } from "date-fns";
import {
  addSeparator,
  dateTypeOptions,
  formatDateTimeAsDateTime,
  testProgressOptions,
} from "src/utils";
import { CompleteActionComponentProps } from "@components/interfaces";
import CodeBlock from "@components/codeblock/codeblock";
import { IconDatabaseShare, IconMathFunction } from "@tabler/icons-react";
import { useModal } from "@refinedev/core";
import CreateAutomation from "pages/automations/create";
import { useDisclosure } from "@mantine/hooks";
import { Text } from "@mantine/core";
import { useAppStore } from "src/store";

export function TestFlightsAndHotelsBooking<T extends Record<string, any>>({
  setActionType,
  action_options,
  identity,
  data_items,
  open,
  close,
  opened,
  record,
  data_table,
  action_step,
  variant = "default",
  activeActionOption,
  setActiveActionOption,
}: CompleteActionComponentProps<T>) {
  const invalidate = useInvalidate();
  const { activeRequestData, setActiveRequestData } = useAppStore();
  const [openedAutomation, { open: openAutomation, close: closeAutomation }] =
    useDisclosure(false);
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
  } = useCustomMutation();
  const {
    getInputProps,
    saveButtonProps,
    setFieldValue,
    values,
    refineCore: { formLoading, onFinish },
    onSubmit,
  } = useForm({
    initialValues: {
      author: identity?.email,
      author_email: identity?.email,
      trip_id: record?.trip_id,
      test_description: "",
    },
  });

  const handleSubmit = (e: any) => {
    let request_data = {
      ...activeActionOption,
      id: addSeparator(activeActionOption?.id, "action_options"),
      values: {
        ...record,
        ...values, // so i can override original in the form if not disabled
        action_options: [
          addSeparator(activeActionOption?.id, "action_options"),
        ],
      },
    };
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
      method: "post",
      values: request_data,
      successNotification: (data, values) => {
        invalidate({
          resource: "caesars_bookings",
          invalidates: ["list"],
        });
        // close();
        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when executing`,
          description: "Error",
          type: "error",
        };
      },
    });
  };

  const handleSaveOnly = (e: any) => {
    let request_data = {
      ...activeActionOption,
      options: {
        ...activeActionOption?.options,
        execution_action_step_names: [
          "get_collection_info_1",
          "get_credential_info_1",
          "update_record_fields_1",
        ],
        execute_by: "execution_action_step_names",
        execution_includes: "save_only",
      },
      id: addSeparator(activeActionOption?.id, "action_options"),
      values: {
        ...record,
        ...values, // so i can override original in the form if not disabled
        action_options: [
          addSeparator(activeActionOption?.id, "action_options"),
        ],
      },
    };
    // console.log("mode", "save_only");
    // console.log("request_data", request_data);
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
      method: "post",
      values: request_data,
      successNotification: (data, values) => {
        invalidate({
          resource: "caesars_bookings",
          invalidates: ["list"],
        });
        // close();
        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        return {
          message: `Something went wrong when executing`,
          description: "Error",
          type: "error",
        };
      },
    });
  };

  const handleCreateAutomation = () => {
    let request_data = {
      ...activeActionOption,
      options: {
        ...activeActionOption?.options,
        execution_action_step_names: [
          "get_collection_info_1",
          "get_credential_info_1",
          "update_record_fields_1",
        ],
        execute_by: "execution_action_step_names",
        execution_includes: "save_only",
      },
      id: addSeparator(activeActionOption?.id, "action_options"),
      values: {
        ...record,
        ...values, // so i can override original in the form if not disabled
        action_options: [
          addSeparator(activeActionOption?.id, "action_options"),
        ],
      },
    };
    setActiveRequestData(request_data);
    openAutomation();
  };

  return (
    <Create
      // isLoading={formLoading}
      isLoading={mutationIsLoading}
      saveButtonProps={{
        disabled: saveButtonProps?.disabled,
        onClick: handleSubmit,
        size: "xs",
      }}
      title={<Title order={3}>Configure And Execute Action</Title>}
      goBack={false}
      footerButtons={({ saveButtonProps }) => (
        <div className="flex w-full gap-4">
          {/* <SaveButton
            {...saveButtonProps}
            className="flex-grow w-1/2"
            variant="light"
            leftIcon={<IconDatabaseShare size={16} />}
            disabled={mutationIsLoading}
            onClick={handleSaveOnly}
          >
            CreateSave Automation
          </SaveButton> */}
          <Button
            resource="automations"
            size="xs"
            variant="light"
            onClick={() => {
              if (openedAutomation) {
                closeAutomation();
              } else {
                handleCreateAutomation();
              }
            }}
          >
            {openedAutomation ? "Close Automation" : "Create Automation"}
          </Button>
          <SaveButton
            {...saveButtonProps}
            className="flex-grow w-1/2"
            variant="filled"
            leftIcon={<IconMathFunction size={16} />}
            disabled={mutationIsLoading}
          >
            Save and Run Action
          </SaveButton>
        </div>
      )}
    >
      {/* {visible && (
        <>
          <p>Dummy Modal Content</p>
          <button onClick={close}>Close Modal</button>
        </>
      )} */}
      <Text>
        <b>Action: </b>
        {activeActionOption?.display_name}
      </Text>
      <TextInput
        required
        mt="sm"
        label="trip_id"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("trip_id")}
        // value={record?.sst_internal_id}
        disabled
        // required
      />
      <Textarea
        autosize
        minRows={2}
        mt="sm"
        label="test_description"
        {...getInputProps("test_description")}
        // required
      />

      {openedAutomation && <CreateAutomation></CreateAutomation>}
    </Create>
  );
}

export default TestFlightsAndHotelsBooking;
