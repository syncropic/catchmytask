import {
  Button,
  LoadingOverlay,
  MultiSelect,
  NumberInput,
  Select,
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
import CodeBlock from "@components/codeblock/codeblock";
import { IconDatabaseShare, IconMathFunction } from "@tabler/icons-react";

export function AddToQueue<T extends Record<string, any>>({
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
      queue_name: "",
      sst_internal_id: record?.sst_internal_id,
      sst_booking_full_name: record?.sst_booking_full_name,
      flight_pnr: record?.flight_pnr,
      queue_item_author: identity?.email,
      queue_item_comments: "",
      queue_item_status: "pending",
      queue_item_priority: "low",
      queue_item_assigned: identity?.email,
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
      // options: {
      //   ...activeActionOption?.options,
      //   execution_action_step_names: [
      //     "get_collection_info_1",
      //     "get_credential_info_1",
      //     "update_record_fields_1",
      //   ],
      //   execute_by: "execution_action_step_names",
      //   execution_includes: "save_only",
      // },
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
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/save`,
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
        onClick: handleSaveOnly,
        size: "xs",
      }}
      title={<Title order={3}>Configure And Execute Action</Title>}
      goBack={false}
      footerButtons={({ saveButtonProps }) => (
        <div className="flex w-full gap-4">
          {/* <SaveButton
            {...saveButtonProps}
            className="flex-grow w-1/3"
            variant="light"
            leftIcon={<IconDatabaseShare size={16} />}
            disabled={mutationIsLoading}
            onClick={handleSaveOnly}
          >
            Save Only
          </SaveButton> */}
          <SaveButton
            {...saveButtonProps}
            className="flex-grow"
            variant="filled"
            leftIcon={<IconMathFunction size={16} />}
            disabled={mutationIsLoading}
          >
            Save
          </SaveButton>
        </div>
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
        // value={record?.sst_internal_id}
        disabled
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
        // value={record?.sst_internal_id}
        disabled
        // required
      />

      <TextInput
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
      />
      <Select
        required
        searchable
        mt="sm"
        label="queue_name"
        // placeholder="Select date type"
        data={[
          "caesars_flights_schedule_change",
          "caesars_flights_smartbooking",
          "caesars_flights_ticketing",
        ]} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("queue_name")}
        // value={record?.sst_booking_full_name}
        // disabled
        // required
      />
      <Select
        required
        searchable
        mt="sm"
        label="queue_item_assigned"
        // placeholder="Select date type"
        data={[
          "david.wanjala@snowstormtech.com",
          "cyrus.gautam@snowstormtech.com",
        ]} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("queue_item_assigned")}
        // value={record?.sst_booking_full_name}
        // disabled
        // required
      />

      <TextInput
        required
        mt="sm"
        label="queue_item_author"
        // placeholder="Select date type"
        // data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("queue_item_author")}
        // value={record?.sst_booking_full_name}
        disabled
        // required
      />
      <Select
        required
        searchable
        mt="sm"
        label="queue_item_priority"
        // placeholder="Select date type"
        data={["low", "medium", "high", "urgent"]} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("queue_item_priority")}
        // value={record?.sst_booking_full_name}
        // disabled
        // required
      />
      <Select
        required
        searchable
        mt="sm"
        label="queue_item_status"
        // placeholder="Select date type"
        data={["pending", "resolved"]} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("queue_item_status")}
        // value={record?.sst_booking_full_name}
        // disabled
        // required
      />
      <Textarea
        autosize
        minRows={2}
        mt="sm"
        label="queue_item_comments"
        {...getInputProps("queue_item_comments")}
        // required
      />
    </Create>
  );
}

export default AddToQueue;
