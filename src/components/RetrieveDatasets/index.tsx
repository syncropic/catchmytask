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

export function RetrieveDatasets<T extends Record<string, any>>({
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
      start_date: "",
      end_date: "",
      date_type: [] as string[],
      custom_message: "",
      // custom_message: "",
      mail_list: [] as string[],
      id: "",
      // to_email_list: ["dp.wanjala@gmail.com"] as string[],
      // cc_email_list: [] as string[],
      // tags: "",
      // from: "david.wanjala@snowstormtech.com",
      email_type: ["default"] as string[],
    },
  });

  const handleSubmit = (e: any) => {
    // console.log("values", values);
    let start_date: string = values?.start_date;
    let end_date: string = values?.end_date;

    // Function to format date, handling both string and Date types
    const formatDate = (date: string | Date): string => {
      // if (!date) {
      //     return undefined;
      // }
      if (typeof date === "string") {
        // Handle as string
        return format(parseISO(date), "yyyy-MM-dd");
      } else {
        // Handle as Date object
        return format(date, "yyyy-MM-dd");
      }
    };

    // Convert dates to 'yyyy-MM-dd' format
    start_date = formatDate(start_date);
    end_date = formatDate(end_date);

    if (!start_date || !end_date) {
      console.error("Invalid date format");
      return; // or handle error appropriately
    }

    // console.log("start_date", start_date);
    // console.log(activeItem);

    const task = activeActionOption;
    // const action_step = null;
    const resource = "onewurld_bookings";
    const record = {
      ...values,
      start_date: start_date,
      end_date: end_date,
    };

    let request_data = {
      ...task,
      id: addSeparator(task?.id, "action_options"),
      task_input: {
        ...task?.task_input,
        get_collection_info_1: {
          ...task?.task_input?.get_collection_info_1,
          end_date: formatDateTimeAsDateTime(new Date()),
          start_date: formatDateTimeAsDateTime(new Date()),
        },
        create_email_message_1: {
          email_type: record?.email_type,
          personal_message: record?.custom_message,
          internal_message: record?.custom_message,
          custom_message: record?.custom_message,
        },
        send_email_message_1: {
          mail_list: record?.mail_list,
        },
        generate_sql_query_1: {
          text_query: task?.task_input?.generate_sql_query_1?.text_query
            ?.replace("${start_date}", record?.start_date)
            .replace("${end_date}", record?.end_date),
        },
        generate_sql_query_2: {
          text_query: task?.task_input?.generate_sql_query_2?.text_query
            ?.replace("${start_date}", record?.start_date)
            .replace("${end_date}", record?.end_date),
        },
      },
      task: {
        ...task?.task,
        id: action_step?.in,
      },
      destination: {
        ...task?.destination,
        record: addSeparator(record?.id, resource),
      },
    };

    // Conditionally adding execution_orders_range
    if (action_step) {
      request_data.options = {
        ...task?.options,
        execution_orders_range: [
          action_step?.execution_order,
          action_step?.execution_order,
        ],
      };
      request_data.values = {
        action_step_id: addSeparator(action_step?.id, "execute"),
        task_id: action_step?.in,
        resource: resource,
        author: identity?.email,
        record: addSeparator(record?.id, resource),
      };
      request_data.task = {
        ...task?.task,
        id: action_step?.in, // this is already known if running an action_step on an existing task
      };
    } else {
      request_data.options = {
        ...task?.options,
        update_record: false,
      };
      request_data.values = {
        // action_step_id: addSeparator(action_step?.id, "execute"),
        // task_id: action_step?.in,
        ...record,
        resource: "action_runs",
        author: identity?.email,
        record: addSeparator(record?.id, resource),
        action_options: [addSeparator(task?.id, "action_options")],
      };
      request_data.task = {
        ...task?.task,
        // id: will fill in when task is generated
      };
    }
    // console.log(request_data);

    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
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
      <MultiSelect
        required
        mt="sm"
        label="date_type"
        placeholder="Select date type"
        data={dateTypeOptions} // Replace with your options source
        // value={getInputProps("date_type").value}
        // onChange={handleNameChange}
        {...getInputProps("date_type")}
        // required
      />
      <DateInput
        required
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="start_date"
        placeholder="Start date"
        {...getInputProps("start_date")}
      />
      <DateInput
        required
        valueFormat="DD/MM/YYYY HH:mm:ss"
        label="end_date"
        placeholder="End date"
        {...getInputProps("end_date")}
      />

      {openedAutomation && <CreateAutomation></CreateAutomation>}
    </Create>
  );
}

export default RetrieveDatasets;
