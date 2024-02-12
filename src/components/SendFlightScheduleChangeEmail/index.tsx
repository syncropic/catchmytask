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
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { format, parseISO } from "date-fns";
import {
  addSeparator,
  dateTypeOptions,
  formatDateTimeAsDateTime,
} from "src/utils";
import { CompleteActionComponentProps } from "@components/interfaces";

export function SendFlightScheduleChangeEmail({
  setActionType,
  action_options,
  identity,
  data_items,
  open,
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
      flight_airline_reference_code: "",
      contact_email: "",
      contact_name: "",
      flight_change_pnr_old_text: "",
      flight_change_pnr_new_text: "",
    },
  });

  const handleActionChange = (value: string[]) => {
    const item = action_options.find((item) => item.value === value[0]);
    // setActiveItem(item);
    // setActionType("create");
    setFieldValue("action", value);
  };

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
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/create`,
      method: "post",
      values: request_data,
      successNotification: (data, values) => {
        // invalidateCallback();
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
      // contentProps={{
      //   style: {
      //     // backgroundColor: "cornflowerblue",
      //     padding: "16px",
      //     height: "420px",
      //   },
      // }}
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
        label="sst_internal_id"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("sst_internal_id")}
        value={record?.sst_internal_id}
        disabled
        // required
      />
      {/* <TextInput
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
      /> */}
      <TextInput
        required
        mt="sm"
        label="sst_booking_full_name"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("sst_booking_full_name")}
        value={record?.sst_booking_full_name}
        disabled
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
        label="flight_pnr"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("flight_pnr")}
        value={record?.flight_pnr}
        disabled
        // required
      />
      <Textarea
        autosize
        minRows={5}
        mt="sm"
        label="flight_change_pnr_old_text"
        {...getInputProps("flight_change_pnr_old_text")}
        value={record?.flight_change_pnr_old_text}
      />
      <Textarea
        autosize
        minRows={5}
        mt="sm"
        label="flight_change_pnr_new_text"
        {...getInputProps("flight_change_pnr_new_text")}
        value={record?.flight_change_pnr_new_text}
      />
    </Create>
  );
}

export default SendFlightScheduleChangeEmail;
