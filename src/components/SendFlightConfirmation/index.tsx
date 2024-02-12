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
        <>
          <SaveButton {...saveButtonProps} fullWidth>
            Complete Action
          </SaveButton>
        </>
      )}
    >
      <TextInput
        required
        mt="sm"
        label="flight_airline_reference_code"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("flight_airline_reference_code")}
        value={record?.flight_airline_reference_code}
        // disabled
        // required
      />
      <TextInput
        required
        mt="sm"
        label="contact_email"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("contact_email")}
        value={record?.contact_email}
        // disabled
        // required
      />
      <TextInput
        required
        mt="sm"
        label="contact_name"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("contact_name")}
        value={record?.contact_email}
        // disabled
        // required
      />
    </Create>
  );
}

export default SendFlightConfirmation;
