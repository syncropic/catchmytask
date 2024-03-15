import IframeView from "@components/IframeView";
import { componentMapping, extractFields } from "@components/Utils";
import {
  CompleteActionComponentProps,
  FieldConfiguration,
  IAction,
  IIdentity,
} from "@components/interfaces";
import { Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  HttpError,
  useCustomMutation,
  useGetIdentity,
  useOne,
} from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { IconMathFunction } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import CreateAutomation from "pages/automations/create";
import CreateChat from "pages/chat/create";
import { useAppStore } from "src/store";
import { addSeparator, formatDateTimeAsDateTime } from "src/utils";

export function ActionControlForm<T extends Record<string, any>>({
  activeSession,
  activeRecords,
  activeActionOption: activeActionOptionArg,
}: CompleteActionComponentProps<T>) {
  const { activeViewItem, activeActionOption } = useAppStore();
  const { data, isLoading, isError, error } = useOne<IAction, HttpError>({
    resource: "action_options",
    id: activeActionOption?.id,
  });
  console.log("data", data);
  const extractedFields = extractFields(
    activeRecords[0] || {},
    activeActionOption?.field_configurations || []
  );
  const [openedAutomation, { open: openAutomation, close: closeAutomation }] =
    useDisclosure(false);
  const [openedChat, { open: openChat, close: closeChat }] =
    useDisclosure(false);
  const { data: identity } = useGetIdentity<IIdentity>();
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
      ...extractedFields,
    },
    refineCoreProps: {},
    transformValues: (values) => {
      return {
        ...values,
        // id: uuidv4(), // if creating new item
      };
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
    const action_step = null;
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
          // personal_message: record?.custom_message,
          // internal_message: record?.custom_message,
          // custom_message: record?.custom_message,
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

  // const handleSubmit = (e: any) => {
  //   let request_data = {
  //     ...activeActionOption,
  //     id: addSeparator(activeActionOption?.id, "action_options"),
  //     values: {
  //       ...activeRecords[0],
  //       ...values, // so i can override original in the form if not disabled
  //       action_options: [
  //         addSeparator(activeActionOption?.id, "action_options"),
  //       ],
  //     },
  //   };
  //   mutate({
  //     url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
  //     method: "post",
  //     values: request_data,
  //     successNotification: (data, values) => {
  //       invalidate({
  //         resource: "caesars_bookings",
  //         invalidates: ["list"],
  //       });
  //       close();
  //       return {
  //         message: `successfully executed.`,
  //         description: "Success with no errors",
  //         type: "success",
  //       };
  //     },
  //     errorNotification: (data, values) => {
  //       return {
  //         message: `Something went wrong when executing`,
  //         description: "Error",
  //         type: "error",
  //       };
  //     },
  //   });
  // };

  // const handleSaveOnly = (e: any) => {
  //   let request_data = {
  //     ...activeActionOption,
  //     options: {
  //       ...activeActionOption?.options,
  //       execution_action_step_names: [
  //         "get_collection_info_1",
  //         "get_credential_info_1",
  //         "update_record_fields_1",
  //       ],
  //       execute_by: "execution_action_step_names",
  //       execution_includes: "save_only",
  //     },
  //     id: addSeparator(activeActionOption?.id, "action_options"),
  //     values: {
  //       ...activeRecords[0],
  //       ...values, // so i can override original in the form if not disabled
  //       action_options: [
  //         addSeparator(activeActionOption?.id, "action_options"),
  //       ],
  //     },
  //   };
  //   // console.log("mode", "save_only");
  //   // console.log("request_data", request_data);
  //   mutate({
  //     url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
  //     method: "post",
  //     values: request_data,
  //     successNotification: (data, values) => {
  //       invalidate({
  //         resource: "caesars_bookings",
  //         invalidates: ["list"],
  //       });
  //       // close();
  //       return {
  //         message: `successfully executed.`,
  //         description: "Success with no errors",
  //         type: "success",
  //       };
  //     },
  //     errorNotification: (data, values) => {
  //       return {
  //         message: `Something went wrong when executing`,
  //         description: "Error",
  //         type: "error",
  //       };
  //     },
  //   });
  // };

  const viewComponent = (activeViewItem, activeRecord) => {
    if (!activeViewItem) {
      return null;
    }
    if (!activeViewItem?.resource_type) {
      return null;
    }
    const Component = componentMapping[activeViewItem.resource_type];
    return <Component item={activeRecord} />;
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
      breadcrumb={false}
      title={false}
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
            Save Values
          </SaveButton> */}
          <SaveButton
            {...saveButtonProps}
            className="flex-grow w-2/3"
            variant="filled"
            leftIcon={<IconMathFunction size={16} />}
            disabled={mutationIsLoading}
          >
            Run
          </SaveButton>
          <Button
            resource="automations"
            size="xs"
            variant="light"
            onClick={() => {
              if (openedChat) {
                closeChat();
              } else {
                openChat();
              }
            }}
          >
            {openedChat ? "Close Chat" : "Chat"}
          </Button>
          <Button
            resource="automations"
            size="xs"
            variant="light"
            onClick={() => {
              if (openedAutomation) {
                closeAutomation();
              } else {
                openAutomation();
              }
            }}
          >
            {openedAutomation ? "Close Automation" : "Automate"}
          </Button>
        </div>
      )}
    >
      {JSON.stringify(activeActionOption)}
      {activeActionOption?.name === "view"
        ? viewComponent(activeViewItem, activeRecords[0])
        : null}
      {activeActionOption?.field_configurations &&
        activeActionOption?.field_configurations?.map(
          (field: FieldConfiguration) => {
            const Component = componentMapping[field.display_component];
            return (
              <div key={field.field_name} className="mb-4">
                <Component
                  {...getInputProps(field.field_name)}
                  {...field.props}
                  label={field.display_name}
                />
              </div>
            );
          }
        )}
      {openedChat && <CreateChat></CreateChat>}
      {openedAutomation && <CreateAutomation></CreateAutomation>}
    </Create>
  );
}

export default ActionControlForm;
