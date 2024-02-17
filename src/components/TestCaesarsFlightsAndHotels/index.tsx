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
  testProgressOptions,
} from "src/utils";
import { CompleteActionComponentProps } from "@components/interfaces";
import CodeBlock from "@components/codeblock/codeblock";
import { IconDatabaseShare, IconMathFunction } from "@tabler/icons-react";

export function TestCaesarsFlightsAndHotels<T extends Record<string, any>>({
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
      // sst_booking_full_name: record?.sst_booking_full_name,
      // test run data, dropdown for saved to utilize etc.
      test_id: "",
      test_environment: "",
      test_description: "",
      test_base_url: "",
      test_progress_option: "",

      // contact_email: record?.contact_email,
      // flight_pnr: record?.flight_pnr,
      // flight_change_pnr_old_text: record?.flight_change_pnr_old_text,
      // flight_change_pnr_new_text: record?.flight_change_pnr_new_text,
      // flight_change_assigned_agent: record?.flight_change_assigned_agent,
      // flight_change_remarks: record?.flight_change_remarks,
      // flight_change_status: record?.flight_change_status,
      // flight_change_type: record?.flight_change_type,
      // flight_change_message: record?.flight_change_message,
      // flight_airline_reference_code: record?.flight_airline_reference_code,
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
      <TextInput
        required
        mt="sm"
        label="test_id"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("test_id")}
        // value={record?.sst_internal_id}
        // disabled
        // required
      />
      <TextInput
        required
        mt="sm"
        label="test_name"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("test_name")}
        // value={record?.sst_internal_id}
        // disabled
        // required
      />
      <TextInput
        required
        mt="sm"
        label="test_base_url"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("test_base_url")}
        // value={record?.sst_internal_id}
        // disabled
        // required
      />

      <MultiSelect
        required
        mt="sm"
        label="test_progress_option"
        placeholder="test_progress_option"
        data={testProgressOptions} // Replace with your options source
        maxSelectedValues={1}
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("test_progress_option")}
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
      {/* <TextInput
        required
        mt="sm"
        label="flight_airline_reference_code"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("flight_airline_reference_code")}
        // value={record?.flight_airline_reference_code}
        // disabled
        // required
      /> */}
      {/* <TextInput
        required
        mt="sm"
        label="sst_booking_full_name"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("sst_booking_full_name")}
        // value={record?.sst_booking_full_name}
        disabled
        // required
      /> */}
      {/*       
      <TextInput
        required
        mt="sm"
        label="flight_pnr"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("flight_pnr")}
        // value={record?.flight_pnr}
        disabled
        // required
      /> */}

      {/* <Textarea
        autosize
        minRows={2}
        mt="sm"
        label="flight_change_remarks"
        {...getInputProps("flight_change_remarks")}
        // required
      />
      <TextInput
        // required
        mt="sm"
        label="flight_change_status"
        {...getInputProps("flight_change_status")}
        // value={record?.flight_pnr}
        // disabled
        // required
      />
      <TextInput
        // required
        mt="sm"
        label="flight_change_assigned_agent"
        {...getInputProps("flight_change_assigned_agent")}
        // value={record?.flight_pnr}
        // disabled
        // required
      /> */}
    </Create>
  );
}

export default TestCaesarsFlightsAndHotels;
