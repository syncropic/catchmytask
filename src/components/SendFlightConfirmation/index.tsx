import {
  Button,
  LoadingOverlay,
  MultiSelect,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useCustomMutation, useInvalidate } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { format, parseISO } from "date-fns";
import {
  addSeparator,
  dateTypeOptions,
  formatDateTimeAsDateTime,
} from "src/utils";
import { CompleteActionComponentProps } from "@components/interfaces";
import CodeBlock from "@components/codeblock/codeblock";
import { IconDatabaseShare, IconMathFunction } from "@tabler/icons-react";

export function SendFlightConfirmation({
  setActionType,
  action_options,
  identity,
  data_items,
  open,
  close,
  opened,
  record,
  action_step,
  variant = "default",
  activeActionOption,
  setActiveActionOption,
}: CompleteActionComponentProps) {
  const invalidate = useInvalidate();
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
      flight_airline_reference_code: record?.flight_airline_reference_code,
      contact_email: record?.contact_email,
      contact_name: record?.contact_name,
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
        close();
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

  return (
    <Create
      // isLoading={formLoading}
      isLoading={mutationIsLoading}
      saveButtonProps={{
        disabled: saveButtonProps?.disabled,
        onClick: handleSubmit,
        size: "xs",
      }}
      title={<Title order={3}>Configure and Execute Action</Title>}
      goBack={false}
      footerButtons={({ saveButtonProps }) => (
        <div className="flex w-full gap-4">
          <SaveButton
            {...saveButtonProps}
            className="flex-grow w-1/3"
            variant="light"
            leftIcon={<IconDatabaseShare size={16} />}
            disabled={mutationIsLoading}
            onClick={handleSaveOnly}
          >
            Save Only
          </SaveButton>
          <SaveButton
            {...saveButtonProps}
            className="flex-grow w-2/3"
            variant="filled"
            leftIcon={<IconMathFunction size={16} />}
            disabled={mutationIsLoading}
          >
            Save and Run Action
          </SaveButton>
        </div>
      )}
    >
      <TextInput
        required
        mt="sm"
        label="flight_airline_reference_code"
        placeholder="flight_airline_reference_code"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("flight_airline_reference_code")}
        // value={record?.flight_airline_reference_code}
        // disabled
        // required
      />
      <TextInput
        required
        mt="sm"
        label="contact_email"
        placeholder="contact_email"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("contact_email")}
        // value={record?.contact_email}
        // disabled
        // required
      />
      <TextInput
        required
        mt="sm"
        label="contact_name"
        placeholder="contact_name"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("contact_name")}
        // value={record?.contact_email}
        // disabled
        // required
      />
    </Create>
  );
}

export default SendFlightConfirmation;
