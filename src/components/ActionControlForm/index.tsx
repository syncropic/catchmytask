import { componentMapping } from "@components/Utils";
import ViewActionHistory from "@components/ViewActionHistory";
import CodeBlock from "@components/codeblock/codeblock";
import {
  CompleteActionComponentProps,
  FieldConfiguration,
  IIdentity,
  IListItem,
} from "@components/interfaces";
import { Accordion, Button, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { IconMathFunction } from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import CreateAutomation from "pages/automations/create";
import { useEffect } from "react";
import { useAppStore } from "src/store";
import { addSeparator, formatDateTimeAsDateTime } from "src/utils";

export function ActionControlForm<T extends Record<string, any>>({
  activeSession,
  activeAction,
  activeRecords,
  actionFormFieldValues,
}: CompleteActionComponentProps<T>) {
  const { activeViewItem } = useAppStore();
  console.log("actionFormFieldValues", actionFormFieldValues);
  // let activeRecordId = activeRecords[0]?.id;
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
    reset,
  } = useForm({
    initialValues: {
      author: identity?.email,
      author_email: identity?.email,
      ...actionFormFieldValues,
    },
    refineCoreProps: {},
    transformValues: (values) => {
      return {
        ...values,
        // id: uuidv4(), // if creating new item
      };
    },
  });

  // // Use useEffect to react to changes in actionFormFieldValues
  // useEffect(() => {
  //   // Loop through each field in actionFormFieldValues
  //   Object.entries(actionFormFieldValues).forEach(([key, value]) => {
  //     // Update the form field value
  //     setFieldValue(key, value);
  //   });
  // }, [actionFormFieldValues, setFieldValue]);
  // // console.log("values", values);
  useEffect(() => {
    reset();

    // Step 1: Reset form with only 'author' and 'author_email'
    const resetValues = {
      author: identity?.email,
      author_email: identity?.email,
    };

    // Reinitialize form with base values plus dynamic actionFormFieldValues
    Object.entries({
      ...resetValues,
      ...actionFormFieldValues,
    }).forEach(([key, value]) => {
      setFieldValue(key, value);
    });
  }, [actionFormFieldValues, identity?.email]);

  const generateRequestData = (values: any) => {
    let request_data = {
      ...values,
    };

    return request_data;
  };

  const handleSubmit = (e: any) => {
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
      method: "post",
      values: generateRequestData(values),
      successNotification: (data, values) => {
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

  const viewComponent = (activeViewItem: any, activeRecord: any) => {
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
            className="flex-grow w-2/3"
            variant="filled"
            leftIcon={<IconMathFunction size={16} />}
            disabled={mutationIsLoading}
          >
            Run
          </SaveButton> */}
          <SaveButton
            {...saveButtonProps}
            className="flex-grow w-2/3"
            variant="filled"
            leftIcon={<IconMathFunction size={16} />}
            disabled={mutationIsLoading}
          >
            {activeAction?.display_name || "Run"}
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
      {/* {JSON.stringify(actionFormFieldValues)} */}
      {/* <div>actioncontrolform</div> */}
      {/* {JSON.stringify(activeAction)} */}
      <Accordion multiple defaultValue={["new_action"]}>
        <Accordion.Item key="action_history" value="action_history">
          <Accordion.Control>Action History</Accordion.Control>
          <Accordion.Panel>
            {/* <div>
              List of previous {activeAction?.name} for{" "}
              {JSON.stringify(extractIdentifier(activeRecords[0]))}
            </div> */}
            <ViewActionHistory></ViewActionHistory>
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item key="new_action" value="new_action">
          <Accordion.Control>New Action</Accordion.Control>
          <Accordion.Panel>
            {activeAction?.name === "view"
              ? viewComponent(activeViewItem, activeRecords[0])
              : null}
            {activeAction?.field_configurations &&
              activeAction?.field_configurations?.map(
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
            {openedChat && (
              <div>
                <div>Chat History:</div>
                <Textarea
                  minRows={5}
                  required
                  mt="sm"
                  label="chat_message"
                  placeholder="chat_message"
                  // data={dateTypeOptions} // Replace with your options source
                  // value={getInputProps("date_type").value}
                  // onChange={handleNameChange}
                  {...getInputProps("chat_message")}
                  // value={record?.contact_email}
                  // disabled
                  // required
                />
              </div>
            )}
            {openedAutomation && <CreateAutomation></CreateAutomation>}
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item key="more_details" value="more_details">
          <Accordion.Control>More Details</Accordion.Control>
          <Accordion.Panel>
            <CodeBlock jsonData={activeRecords[0]}></CodeBlock>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Create>
  );
}

export default ActionControlForm;
