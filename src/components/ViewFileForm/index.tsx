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
import { useEffect, useRef } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

// let identifier = uuidv4();

export function CloneForm<T extends Record<string, any>>({
  resource,
  activeActionOption,
  activeRecord,
  extractedFields,
}: FormComponentProps<T>) {
  // const invalidate = useInvalidate();
  const { data: identity } = useGetIdentity<IIdentity>();
  const { mutate, isError, isLoading } = useCreate();
  const { id } = useParsed();
  // console.log("id", id);
  const {
    mutate: mutateCustom,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
    data: mutationData,
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
      ...activeRecord,
    },
    refineCoreProps: {
      resource: resource,
      id: id,
    },
  });

  const getFileContent = () => {
    // setActiveQuery(values);
    // setActiveQuery(record?.active_query);
    let request_data = {
      author: identity?.email,
      author_email: identity?.email,
      query: activeRecord?.file_path,
      query_language: "read_file_by_path",
      credentials: "surrealdb_catchmytask",
    };
    console.log("request_data", request_data);
    mutateCustom({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
      dataProviderName: "catchmytaskApiDataProvider",
      method: "post",
      values: request_data,
      successNotification: (data, values) => {
        // invalidate({
        //   resource: "caesars_bookings",
        //   invalidates: ["list"],
        // });
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

  // getFileContent after the component mounts
  useEffect(() => {
    getFileContent();
  }, []);

  const monaco = useMonaco();
  const editorRef = useRef(null);

  function handleEditorChange(value, event) {
    // console.log("here is the current model value:", value);
    // setFieldValue("query", value);
  }

  const options = {
    // autoIndent: "full",
    // contextmenu: true,
    // fontFamily: "monospace",
    // fontSize: 13,
    // lineHeight: 24,
    // hideCursorInOverviewRuler: true,
    // matchBrackets: "always",
    // minimap: {
    //   enabled: true,
    // },
    // scrollbar: {
    //   horizontalSliderSize: 4,
    //   verticalSliderSize: 18,
    // },
    // selectOnLineNumbers: true,
    // roundedSelection: false,
    // readOnly: false,
    // cursorStyle: "line",
    automaticLayout: true,
    wordWrap: "on",
  };

  useEffect(() => {
    if (monaco) {
      console.log("here is the monaco instance:", monaco);
      // register autocompletions
      // monaco.languages.registerCompletionItemProvider("javascript", {
      //   provideCompletionItems: async () => {
      //     // Get current cursor position
      //     const position = editorRef?.current.getPosition();
      //     // Get text before cursor
      //     const textBeforeCursor = editorRef?.current
      //       .getModel()
      //       .getValueInRange({
      //         startLineNumber: 1,
      //         startColumn: 1,
      //         endLineNumber: position.lineNumber,
      //         endColumn: position.column,
      //       });

      //     // // Call language model for autocomplete suggestions
      //     // const gpt3 = new GPT3({ apiKey: 'YOUR_API_KEY' });
      //     // const suggestions = await gpt3.completion({
      //     //   prompt: textBeforeCursor,
      //     //   maxTokens: 5, // Adjust max tokens as needed
      //     // });
      //     // const suggestions = handleGenerateCompletion(textBeforeCursor);
      //     let completions = ["first"];
      //     // Format suggestions for Monaco Editor
      //     const completionItems = completions.map((choice) => ({
      //       label: "text to insert label",
      //       kind: monaco.languages.CompletionItemKind.Keyword,
      //       insertText: "text to  insert",
      //     }));

      //     return {
      //       suggestions: completionItems,
      //     };
      //   },
      // });
    }
  }, [monaco]);

  function handleEditorDidMount(editor, monaco) {
    console.log("onMount: the editor instance:", editor);
    console.log("onMount: the monaco instance:", monaco);
    editorRef.current = editor;
  }
  // update the content of the editor when mutationData changes
  useEffect(() => {
    // check if mutationData is not null and the editorRef is not null
    if (mutationData && editorRef.current) {
      console.log("mutationData", mutationData);
      editorRef.current.setValue(mutationData?.data?.content);
    }
  }, [mutationData]);

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
      <Text>
        <b>File: </b>
        {activeRecord?.file_path}
      </Text>
      {/* {activeActionOption?.field_configurations &&
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
        })} */}
      {/* <div>viewfile section</div> */}
      <Editor
        height="100vh"
        defaultLanguage="python"
        defaultValue=""
        theme="vs-dark"
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={options}
      />
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
