import MonacoEditor from "@components/MonacoEditor";
import {
  componentMapping,
  extractFields,
  extractIdentifier,
  getComponentByResourceType,
  replacePlaceholdersInObject,
} from "@components/Utils";
import { useQueryClient } from "@tanstack/react-query";
import ViewActionHistory from "@components/ViewActionHistory";
import {
  CompleteActionComponentProps,
  ComponentKey,
  FieldConfiguration,
  IIdentity,
  IView,
  QueryControlComponentProps,
} from "@components/interfaces";
import { Accordion, Button, Tabs, Text, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { IconMathFunction } from "@tabler/icons-react";
import _ from "lodash";
import CreateAutomation from "pages/automations/create";
import { useEffect } from "react";
import { useAppStore } from "src/store";
import { v4 as uuidv4 } from "uuid";
import config from "src/config";
// import BlocksEditor from "@components/BlocksEditor";

export function QueryControlForm<T extends Record<string, any>>({
  queryAction,
}: QueryControlComponentProps<T>) {
  // const queryClient = useQueryClient();
  const { activeViewItem, activeRecord, activeSession } = useAppStore();
  const actionFormFieldValues = extractFields(
    activeViewItem?.active_query || {},
    queryAction?.field_configurations || []
  );

  // console.log("actionFormFieldValues", actionFormFieldValues);
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
  const queryClient = useQueryClient();
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

  const generateRequestData = (values: any) => {
    // console.log("values", values);
    // console.log("activeViewItem", activeViewItem);
    // console.log("activeRecord", activeRecord);
    // Merge the activeAction with activeActionFormatted, with activeActionFormatted taking precedence
    let activeActionFormatted = {
      active_query: {
        ...(activeViewItem?.active_query || {}),
        record_identifier: extractIdentifier(activeRecord),
      },
      input_values: values,
      task_input: {
        ...replacePlaceholdersInObject(
          queryAction?.task_input || {},
          values || {}
        ),
      },
      task: {
        ...replacePlaceholdersInObject(queryAction?.task || {}, values || {}),
      },
    };
    const queryActionRequestData = _.merge(
      {},
      queryAction || {},
      activeActionFormatted || {}
    );
    return queryActionRequestData;
  };

  const handleSubmit = (e: any) => {
    // let generatedRequestData = generateRequestData(values);
    // console.log("generatedRequestData", generatedRequestData);
    mutate({
      url: `${config.API_URL}/execute`,
      method: "post",
      values: generateRequestData(values),
      successNotification: (data, values) => {
        // console.log("successNotification", data);
        // invalidate query
        queryClient.invalidateQueries(["list_action_history_1"]);

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
    // console.log("activeViewItem", activeViewItem);
    // return "";
    if (!activeViewItem) {
      return null;
    }
    if (!activeViewItem.resource_type) {
      return null;
    }
    const Component = componentMapping[activeViewItem.resource_type];
    return <Component item={activeRecord} />;
  };

  // console.log("actionFormFieldValues", actionFormFieldValues);
  if (actionFormFieldValues.length === 0) {
    return (
      <div>
        <Text>No query action fields to display</Text>
      </div>
    );
  }

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
          <SaveButton
            {...saveButtonProps}
            className="flex-grow w-2/3"
            variant="filled"
            leftIcon={<IconMathFunction size={16} />}
            disabled={mutationIsLoading}
          >
            {queryAction?.display_name || "Run"}
          </SaveButton>
          <Button
            // resource="automations"
            size="xs"
            variant="light"
            // onClick={() => {
            //   if (openedAutomation) {
            //     closeAutomation();
            //   } else {
            //     openAutomation();
            //   }
            // }}
          >
            {/* {openedAutomation ? "Close Automation" : "Automate"} */}
            Save
          </Button>
        </div>
      )}
    >
      <Tabs defaultValue="blocks">
        <Tabs.List>
          <Tabs.Tab value="blocks">
            <Text size="xs">Blocks</Text>
          </Tabs.Tab>
          <Tabs.Tab value="natural_language">
            <Text size="xs">Natural Language</Text>
          </Tabs.Tab>

          <Tabs.Tab value="sql">
            <Text size="xs">SQL</Text>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="blocks">
          {/* <BlocksEditor values={values} />
           */}
          <div>blocks editor</div>
        </Tabs.Panel>

        <Tabs.Panel value="natural_language">
          <Textarea
            autosize
            minRows={6}
            mt="sm"
            required
            // label="query"
            placeholder="Describe the task/query with natural language"
            {...getInputProps("query")}
          />
        </Tabs.Panel>

        <Tabs.Panel value="sql">
          <MonacoEditor value={values?.query} language="sql" />
        </Tabs.Panel>
      </Tabs>
    </Create>
  );
}

export default QueryControlForm;
