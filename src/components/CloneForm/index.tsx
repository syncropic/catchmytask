import {
  Accordion,
  Button,
  LoadingOverlay,
  MultiSelect,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  useCreate,
  useCustomMutation,
  useGetIdentity,
  useInvalidate,
  useParsed,
} from "@refinedev/core";
import { Create, CreateButton, SaveButton, useForm } from "@refinedev/mantine";
import { format, parseISO } from "date-fns";
import {
  addSeparator,
  dateTypeOptions,
  formatDateTimeAsDateTime,
  testProgressOptions,
} from "src/utils";
import {
  CompleteActionComponentProps,
  FormComponentProps,
  IIdentity,
} from "@components/interfaces";
import CodeBlock from "@components/codeblock/codeblock";
import {
  IconArrowsVertical,
  IconDatabaseShare,
  IconMathFunction,
  IconTableShortcut,
} from "@tabler/icons-react";
import { useModal } from "@refinedev/core";
import CreateAutomation from "pages/automations/create";
import { useDisclosure } from "@mantine/hooks";
import { Text } from "@mantine/core";
import { useAppStore } from "src/store";
import CodeView from "@components/CodeView";
import { v4 as uuidv4 } from "uuid";
import { componentMapping } from "@components/Utils";
// let identifier = uuidv4();

export function CloneForm<T extends Record<string, any>>({
  resource,
  activeActionOption,
  activeRecord,
  extractedFields,
}: FormComponentProps<T>) {
  const invalidate = useInvalidate();
  const { data: identity } = useGetIdentity<IIdentity>();
  const { mutate, isError, isLoading } = useCreate();
  const { id } = useParsed();
  console.log("id", id);

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
      ...activeRecord,
    },
    refineCoreProps: {
      resource: resource,
      id: id,
      // onMutationSuccess: (data, variables, context, isAutoSave) => {
      //   console.log({ data, variables, context, isAutoSave });
      // },
      // onMutationError: (data, variables, context, isAutoSave) => {
      //   console.log({ data, variables, context, isAutoSave });
      // },
      // // invalidates: ["list", "many", "detail"],
      // successNotification: (data, values, resource) => {
      //   return {
      //     message: `Success with no errors`,
      //     description: "Success with no errors",
      //     type: "success",
      //   };
      // },
    },
    transformValues: (values) => {
      return {
        ...values,
        id: uuidv4(),
      };
    },
  });

  // // use mutate in a handleSubmit function
  // const handleSubmit = (e: any) => {
  //   console.log("e", e);
  //   console.log("values", values);
  //   mutate(
  //     {
  //       resource: resource,
  //       values: {
  //         ...values,
  //       },
  //     }
  //     // {
  //     //   onError: (error, variables, context) => {
  //     //     // An error occurred!
  //     //   },
  //     //   onSuccess: (data, variables, context) => {
  //     //     // Let's celebrate!
  //     //   },
  //     // }
  //   );
  // };

  return (
    <Create
      // isLoading={formLoading}
      saveButtonProps={saveButtonProps}
      breadcrumb={false}
      isLoading={isLoading || formLoading}
      // saveButtonProps={{
      //   disabled: saveButtonProps?.disabled,
      //   // onClick: handleSubmit,
      //   size: "xs",
      // }}
      title={<Title order={5}>Clone</Title>}
      goBack={false}
      footerButtons={({ saveButtonProps }) => (
        <div className="flex w-full gap-4">
          <SaveButton
            {...saveButtonProps}
            className="flex-grow w-1/2"
            variant="filled"
            leftIcon={<IconMathFunction size={16} />}
            disabled={formLoading || saveButtonProps?.disabled || isLoading}
          >
            Save
          </SaveButton>
        </div>
      )}
    >
      <Text>
        <b>Action: </b>
        {activeActionOption?.display_name}
      </Text>
      <Text>
        <b>Resource: </b>
        {resource}
      </Text>
      {activeActionOption?.field_configurations &&
        activeActionOption?.field_configurations?.map((field) => {
          const Component = componentMapping[field.component];
          return (
            <div key={field.name} className="mb-4">
              <Component
                {...getInputProps(field.name)}
                {...field.props}
                label={field.label}
              />
            </div>
          );
        })}
      <Accordion>
        <Accordion.Item key="more_details" value="more_details">
          <Accordion.Control icon={<IconArrowsVertical size={16} />}>
            More Details
          </Accordion.Control>
          <Accordion.Panel>
            <CodeBlock jsonData={activeRecord}></CodeBlock>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Create>
  );
}

export default CloneForm;
