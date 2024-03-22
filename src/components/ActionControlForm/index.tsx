import {
  componentMapping,
  getComponentByResourceType,
} from "@components/Utils";
import ViewActionHistory from "@components/ViewActionHistory";
import CodeBlock from "@components/codeblock/codeblock";
import {
  CompleteActionComponentProps,
  ComponentKey,
  FieldConfiguration,
  IIdentity,
  IView,
} from "@components/interfaces";
import { Accordion, Button, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { IconMathFunction } from "@tabler/icons-react";
import _ from "lodash";
import CreateAutomation from "pages/automations/create";
import { useEffect } from "react";
import { useAppStore } from "src/store";
import { formatDateTime } from "src/utils";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";
import MonacoEditor from "@components/MonacoEditor";

export function ActionControlForm<T extends Record<string, any>>({
  activeSession,
  activeAction,
  activeRecords,
  actionFormFieldValues,
}: CompleteActionComponentProps<T>) {
  const queryClient = useQueryClient();
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
      ...actionFormFieldValues,
    },
    refineCoreProps: {},
  });

  useEffect(() => {
    reset();

    // Step 1: Reset form with only 'author' and 'author_email'
    // const resetValues = {
    //   author: identity?.email,
    //   author_email: identity?.email,
    // };

    const resetValues = {
      task_id: uuidv4(),
    };

    // Reinitialize form with base values plus dynamic actionFormFieldValues
    Object.entries({
      ...resetValues,
      ...actionFormFieldValues,
    }).forEach(([key, value]) => {
      setFieldValue(key, value);
    });
  }, [actionFormFieldValues, identity?.email]);

  type ReplacementValues = { [key: string]: string };

  function formatValue(
    value: string,
    dataType: string,
    formatString: string
  ): string {
    // console.log(
    //   `Formatting value: ${value} as ${dataType} with format: ${formatString}`
    // );
    switch (dataType) {
      case "date":
        // Use formatDateTime for date values
        const formattedDate = formatDateTime(value, formatString);
        if (formattedDate !== undefined) {
          return formattedDate;
        } else {
          console.error(
            `Failed to format date value: ${value} with format: ${formatString}`
          );
          return value; // Return original value if formatting fails
        }
      case "number":
        // Add logic for number formatting if necessary
        return value;
      default:
        return value;
    }
  }

  function recursiveReplace(
    currentObj: any,
    replacementValues: { [key: string]: string },
    parentFormats: { [key: string]: string } = {}
  ): any {
    if (typeof currentObj === "string") {
      return currentObj.replace(/\$\{([^}]+)\}/g, (_, variableName) => {
        // console.log(`Found variable: ${variableName}`);
        // Directly construct the expected format key based on the variable name
        const expectedFormatKey = `${variableName}_date_format`;
        const formatSpec = parentFormats[expectedFormatKey];

        if (formatSpec) {
          // console.log(`Using format spec: ${formatSpec} for ${variableName}`);
          // Assuming 'date' as the dataType for simplicity, since that's what's being used
          const formatString = formatSpec; // In your structure, the spec itself is the format string
          let replacementValue = formatValue(
            replacementValues[variableName],
            "date",
            formatString
          );
          return replacementValue;
        } else {
          // console.log(
          //   `No format spec found for ${variableName} using key ${expectedFormatKey}`
          // );
          return replacementValues[variableName] || variableName; // Use original if no format found
        }
      });
    } else if (Array.isArray(currentObj)) {
      return currentObj.map((item) =>
        recursiveReplace(item, replacementValues, parentFormats)
      );
    } else if (typeof currentObj === "object" && currentObj !== null) {
      const childFormats = { ...parentFormats };
      Object.keys(currentObj).forEach((key) => {
        if (key.includes("_format")) {
          // console.log(
          //   `Extracting format for key: ${key}, Format: ${currentObj[key]}`
          // );
          // Add the entire format key and its value to childFormats
          childFormats[key] = currentObj[key];
        }
      });

      const replacedObj: any = {};
      Object.keys(currentObj).forEach((key) => {
        replacedObj[key] = recursiveReplace(
          currentObj[key],
          replacementValues,
          childFormats
        );
      });
      return replacedObj;
    }
    return currentObj;
  }

  function replacePlaceholdersInObject(
    obj: any,
    replacementValues: { [key: string]: string }
  ) {
    return recursiveReplace(obj, replacementValues);
  }

  const generateRequestData = (values: any) => {
    console.log("values", values);
    // Merge the activeAction with activeActionFormatted, with activeActionFormatted taking precedence
    let activeActionFormatted = {
      input_values: values,
      task_input: {
        ...replacePlaceholdersInObject(
          activeAction?.task_input || {},
          values || {}
        ),
      },
      task: {
        ...replacePlaceholdersInObject(activeAction?.task || {}, values || {}),
      },
    };
    const activeActionRequestData = _.merge(
      {},
      activeAction || {},
      activeActionFormatted || {}
    );
    return activeActionRequestData;
  };

  const handleSubmit = (e: any) => {
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/execute`,
      method: "post",
      values: generateRequestData(values),
      successNotification: (data, values) => {
        // console.log("successNotification", data);
        // invalidate query
        return {
          message: `successfully executed.`,
          description: "Success with no errors",
          type: "success",
        };
      },
      errorNotification: (data, values) => {
        // console.log("successNotification", data?.response.status);
        // console.log("errorNotification values", values);
        return {
          message: `${data?.response.status} : ${
            data?.response.statusText
          } : ${JSON.stringify(data?.response.data)}`,
          description: "Error",
          type: "error",
        };
      },
    });
  };

  const viewComponent = (activeViewItem: IView, activeRecord: any) => {
    if (!activeViewItem) {
      return null;
    }
    if (!activeViewItem.resource_type) {
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
                  const Component = getComponentByResourceType(
                    field?.display_component as ComponentKey
                  );
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
            {/* <CodeBlock jsonData={activeRecords[0]}></CodeBlock> */}
            <MonacoEditor values={activeRecords[0]}></MonacoEditor>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Create>
  );
}

export default ActionControlForm;
