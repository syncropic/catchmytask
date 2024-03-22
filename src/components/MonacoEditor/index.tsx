// import { queryClient } from "@components/Utils";
import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";

const MonacoEditor = ({ values }) => {
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const [code, setCode] = useState(JSON.stringify(values, null, 2));
  useEffect(() => {
    if (monaco) {
      console.log("here is the monaco instance:", monaco);
      // register autocompletions
      //   monaco.languages.registerCompletionItemProvider("javascript", {
      //     provideCompletionItems: async () => {
      //       // Get current cursor position
      //       const position = editorRef?.current.getPosition();
      //       // Get text before cursor
      //       const textBeforeCursor = editorRef?.current
      //         .getModel()
      //         .getValueInRange({
      //           startLineNumber: 1,
      //           startColumn: 1,
      //           endLineNumber: position.lineNumber,
      //           endColumn: position.column,
      //         });

      //       // // Call language model for autocomplete suggestions
      //       // const gpt3 = new GPT3({ apiKey: 'YOUR_API_KEY' });
      //       // const suggestions = await gpt3.completion({
      //       //   prompt: textBeforeCursor,
      //       //   maxTokens: 5, // Adjust max tokens as needed
      //       // });
      //       // const suggestions = handleGenerateCompletion(textBeforeCursor);
      //       let completions = ["first"];
      //       // Format suggestions for Monaco Editor
      //       const completionItems = completions.map((choice) => ({
      //         label: "text to insert label",
      //         kind: monaco.languages.CompletionItemKind.Keyword,
      //         insertText: "text to  insert",
      //       }));

      //       return {
      //         suggestions: completionItems,
      //       };
      //     },
      //   });
    }
  }, [monaco]);

  function handleEditorDidMount(editor, monaco) {
    console.log("onMount: the editor instance:", editor);
    //   console.log("onMount: the monaco instance:", monaco);
    //   editorRef.current = editor;
  }

  function handleEditorChange(value, event) {
    // console.log("here is the current model value:", value);
    // setFieldValue("query", value);
    console.log("here is the current model value:", value);
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
  console.log("values", values);

  return (
    <Editor
      height="50vh"
      defaultLanguage="json"
      value={code}
      theme="vs-dark"
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={options}
    />
  );
};

export default MonacoEditor;
