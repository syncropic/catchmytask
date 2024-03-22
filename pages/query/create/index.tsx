import CodeBlock from "@components/codeblock/codeblock";
import { IIdentity } from "@components/interfaces";
import { Tabs, Text, Textarea } from "@mantine/core";
import Editor, { useMonaco } from "@monaco-editor/react";
import {
  IResourceComponentsProps,
  useCustomMutation,
  useGetIdentity,
} from "@refinedev/core";
import { Create, SaveButton, useForm } from "@refinedev/mantine";
import { IconAffiliate } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "src/store";
import ColumnOptionsTool from "./ColumnOptionsTool";
import FilterColumns from "./FilterColumns";
import IncludeColumns from "./IncludeColumns";
import Tables from "./Tables";

// const CopilotTextarea = dynamic(
//   () => import("@copilotkit/react-textarea").then((mod) => mod.CopilotTextarea),
//   {
//     ssr: false, // This disables server-side rendering for this component
//   }
// );

export const PageCreate: React.FC<IResourceComponentsProps> = () => {
  // STORE ITEMS
  const {
    activeRequestData,
    activeQuery,
    setActiveQuery,
    setActiveQueryResults,
  } = useAppStore();
  // IDENTITY
  const { data: identity } = useGetIdentity<IIdentity>();
  const [text, setText] = useState("");

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
      credentials: activeQuery?.credentials || "onewurld_automated_reports",
      query_language: activeQuery?.query_language || "sql",
      query: activeQuery?.query || "",
    },
  });

  // const go = useGo();
  // const { list } = useNavigation();
  const {
    mutate,
    isLoading: mutationIsLoading,
    isError: mutationIsError,
    error: mutationError,
    data: mutationData,
  } = useCustomMutation();
  const {
    mutate: mutateReason,
    isLoading: mutationReasonIsLoading,
    isError: mutationReasonIsError,
    error: mutationReasonError,
    data: mutationReasonData,
  } = useCustomMutation();
  const monaco = useMonaco();
  const editorRef = useRef(null);

  // const { mutate: mutateCreate } = useCreate();

  const handleSubmit = (e: any) => {
    // setActiveQuery(values);
    setActiveQuery({ ...values });
    let request_data = {
      ...values,
      // ...activeActionOption,
      // id: addSeparator(activeActionOption?.id, "action_options"),
      // values: {
      //   ...record,
      //   ...values, // so i can override original in the form if not disabled
      //   billing_addresses: JSON.parse(values?.billing_addresses),
      //   flight_segments: JSON.parse(values?.flight_segments),
      //   hotel_segments: JSON.parse(values?.hotel_segments),
      //   payment_methods: JSON.parse(values?.payment_methods),
      //   trip_passengers: JSON.parse(values?.trip_passengers),
      //   action_options: [
      //     addSeparator(activeActionOption?.id, "action_options"),
      //   ],
      // },
    };
    mutate({
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

  const handleGenerateCompletion = (e: any) => {
    // return "hello"
    // setActiveQuery(values);
    // setActiveQuery({ ...values });
    let request_data = {
      ...values,
      // ...activeActionOption,
      // id: addSeparator(activeActionOption?.id, "action_options"),
      // values: {
      //   ...record,
      //   ...values, // so i can override original in the form if not disabled
      //   billing_addresses: JSON.parse(values?.billing_addresses),
      //   flight_segments: JSON.parse(values?.flight_segments),
      //   hotel_segments: JSON.parse(values?.hotel_segments),
      //   payment_methods: JSON.parse(values?.payment_methods),
      //   trip_passengers: JSON.parse(values?.trip_passengers),
      //   action_options: [
      //     addSeparator(activeActionOption?.id, "action_options"),
      //   ],
      // },
    };
    mutate({
      url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/reason`,
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
  // use effect to update activeQueryResults when mutationData changes
  useEffect(() => {
    if (mutationData) {
      setActiveQueryResults(mutationData);
    }
  }, [mutationData]);

  useEffect(() => {
    if (activeQuery && editorRef.current) {
      //re-render form since activeQuery has changed - trick set one form field to trigger re-render
      setFieldValue("query", activeQuery?.query);
      setFieldValue("query_language", activeQuery?.query_language);
      setFieldValue("credentials", activeQuery?.credentials);
      // set the value of monaco editor as well
      editorRef?.current.setValue(activeQuery?.query);
    }
  }, [activeQuery, editorRef]);

  // const handleChangeFrequencyOption = (value: string) => {
  //   const selectedFrequency = frequency_options.find(
  //     (option) => option.value === value
  //   );
  //   if (selectedFrequency) {
  //     setFieldValue("frequency", selectedFrequency.value);
  //     setFieldValue("frequency_cron_expression", selectedFrequency.cron);
  //   }
  // };
  function handleEditorChange(value, event) {
    // console.log("here is the current model value:", value);
    setFieldValue("query", value);
  }

  const options = {
    autoIndent: "full",
    contextmenu: true,
    fontFamily: "monospace",
    fontSize: 13,
    lineHeight: 24,
    hideCursorInOverviewRuler: true,
    matchBrackets: "always",
    minimap: {
      enabled: true,
    },
    scrollbar: {
      horizontalSliderSize: 4,
      verticalSliderSize: 18,
    },
    selectOnLineNumbers: true,
    roundedSelection: false,
    readOnly: false,
    cursorStyle: "line",
    automaticLayout: true,
  };

  useEffect(() => {
    if (monaco) {
      console.log("here is the monaco instance:", monaco);
      // register autocompletions
      monaco.languages.registerCompletionItemProvider("javascript", {
        provideCompletionItems: async () => {
          // Get current cursor position
          const position = editorRef?.current.getPosition();
          // Get text before cursor
          const textBeforeCursor = editorRef?.current
            .getModel()
            .getValueInRange({
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            });

          // // Call language model for autocomplete suggestions
          // const gpt3 = new GPT3({ apiKey: 'YOUR_API_KEY' });
          // const suggestions = await gpt3.completion({
          //   prompt: textBeforeCursor,
          //   maxTokens: 5, // Adjust max tokens as needed
          // });
          // const suggestions = handleGenerateCompletion(textBeforeCursor);
          let completions = ["first"];
          // Format suggestions for Monaco Editor
          const completionItems = completions.map((choice) => ({
            label: "text to insert label",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "text to  insert",
          }));

          return {
            suggestions: completionItems,
          };
        },
      });
    }
  }, [monaco]);
  function handleEditorDidMount(editor, monaco) {
    console.log("onMount: the editor instance:", editor);
    console.log("onMount: the monaco instance:", monaco);
    editorRef.current = editor;
  }

  return (
    <>
      <Create
        resource="query"
        isLoading={mutationIsLoading}
        saveButtonProps={{
          disabled: saveButtonProps?.disabled,
          onClick: handleSubmit,
          size: "xs",
        }}
        breadcrumb={<></>}
        title={<Text>Construct and run queries in your style!</Text>}
        goBack={false}
        footerButtons={({ saveButtonProps }) => (
          <div className="flex w-full">
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
              className="flex-grow w-3/3"
              variant="filled"
              leftIcon={<IconAffiliate size={16} />}
              disabled={mutationIsLoading}
            >
              Query
            </SaveButton>
          </div>
        )}
      >
        {/* <Text size="sm" mt="xl" mb="sm" fw={500}>
        Query using one of the options below
      </Text> */}
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
            <DynamicTextInput />
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
            {/* <Textarea
              required
              autosize
              minRows={6}
              mt="sm"
              // label="frequency"
              placeholder="Write syntactically correct SQL to execute"
              {...getInputProps("query")}
            /> */}
            <Editor
              height="20vh"
              defaultLanguage="sql"
              defaultValue={values?.query}
              theme="vs-dark"
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={options}
            />
            {/* <CopilotTextarea
              className="px-4 py-4"
              value={text}
              onValueChange={(value: string) => setText(value)}
              placeholder="Type your message here..."
              autosuggestionsConfig={{
                textareaPurpose:
                  "Travel notes from the user's previous vacations. Likely written in a colloquial style, but adjust as needed.",
                chatApiConfigs: {
                  suggestionsApiConfig: {
                    forwardedParams: {
                      max_tokens: 20,
                      stop: [".", "?", "!"],
                    },
                  },
                },
              }}
            /> */}
          </Tabs.Panel>
        </Tabs>
      </Create>
      {mutationIsError && (
        <CodeBlock jsonData={mutationError?.response?.data} />
      )}
      {/* {mutationData && <CodeBlock jsonData={mutationData?.data} />} */}
    </>
  );
};
export default PageCreate;

// DYNAMIC TEXT INPUT
const DynamicTextInput = () => {
  const editorRef = useRef(null);
  const { text, setText, activeColumnOptions } = useAppStore();
  // CUSTOM MUTATION FUNCTION
  // const {
  //   mutate: customMutate,
  //   isLoading: mutationIsLoading,
  //   isError: mutationIsError,
  // } = useCustomMutation();

  // Function to save editor data
  const saveEditorData = async () => {
    if (editorRef.current) {
      // console.log("saveEditorData");
      const savedData = await editorRef.current.save();
      const request_data = savedData;
      console.log("savedData", savedData);
      // customMutate({
      //   url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/query`,
      //   method: "post",
      //   values: request_data,
      //   successNotification: (data, values) => {
      //     // invalidate({
      //     //   resource: "caesars_bookings",
      //     //   invalidates: ["list"],
      //     // });
      //     return {
      //       message: `successfully executed.`,
      //       description: "Success with no errors",
      //       type: "success",
      //     };
      //   },
      //   errorNotification: (data, values) => {
      //     return {
      //       message: `Something went wrong when executing`,
      //       description: "Error",
      //       type: "error",
      //     };
      //   },
      // });
      // setText(JSON.stringify(savedData)); // Update state or send data to server
    }
  };

  useEffect(() => {
    let EditorJS;

    import("@editorjs/editorjs").then((module) => {
      EditorJS = module.default;

      if (!editorRef.current) {
        editorRef.current = new EditorJS({
          holder: "editor",
          tools: {
            // header: Header,
            // list: List,
            // highlightedText: HighlightedText,
            tables: {
              class: Tables,
              // inlineToolbar: true,
            }, // Add the Tables tool here
            include_columns: {
              class: IncludeColumns,
              // inlineToolbar: true,
            }, // Add the Columns tool here
            filter_columns: {
              class: FilterColumns,
              // inlineToolbar: true,
            }, // Add the Columns tool here
            // datePicker: {
            //   class: DateInputTool,
            //   // Optionally, you can specify other configurations for the tool here
            // },
            columnOptions: {
              class: ColumnOptionsTool,
              // Optionally, you can specify other configurations for the tool here
            },
          },
          /**
           * Previously saved data that should be rendered
           */
          data: {
            time: 1709812323137,
            blocks: [
              {
                id: "BOkAAfyzDL",
                type: "paragraph",
                data: {
                  text: "select columns",
                },
              },
              {
                id: "TfLgkHoGMp",
                type: "include_columns",
                data: {
                  selectedItems: activeColumnOptions
                    ?.filter((item) => item?.visible)
                    .map((item) => item?.field_name),
                },
              },
              {
                id: "kkG4aEUbIs",
                type: "paragraph",
                data: {
                  text: "from",
                },
              },
              // {
              //   id: "-cPqG27MHf",
              //   type: "tables",
              //   data: {
              //     selectedItems: ["onewurld bookings"],
              //   },
              // },
            ],
            version: "2.29.0",
          },
          autofocus: true,
          placeholder: "Use (+) to quickly build query with blocks!",
          readOnly: false,
        });
      }
    });

    return () => {
      if (editorRef.current) {
        // Unmount the React component from the DatePicker container
        const datePickerContainers =
          document.querySelectorAll(".date-tool-wrapper");
        datePickerContainers.forEach((container) => {
          ReactDOM.unmountComponentAtNode(container);
        });

        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div className="flex justify-center">
        {/* <Button onClick={saveEditorData}>SAVE</Button> */}
      </div>
      <div id="editor" className="editor-container p-4 bg-white rounded"></div>
    </div>
  );
};
