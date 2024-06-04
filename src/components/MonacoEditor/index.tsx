import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";

interface IEditor {
  value: any;
  language?: string;
  setFieldValue: (field: string, value: any) => void;
  height?: string;
}

const MonacoEditor: React.FC<IEditor> = ({
  value,
  setFieldValue,
  language = "json",
  height = "30vh",
}) => {
  // console.log("value", value);
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const [code, setCode] = useState(() => {
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    } else {
      return value;
    }
  });
  useEffect(() => {
    if (monaco) {
      // console.log("here is the monaco instance:", monaco);
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

  function handleEditorDidMount() {
    // console.log("onMount: the editor instance:", editor);
    //   console.log("onMount: the monaco instance:", monaco);
    //   editorRef.current = editor;
  }

  function handleEditorChange(value: string | undefined) {
    // console.log("here is the current model value:", value);
    setFieldValue("query", value);
  }

  return (
    <Editor
      // height="50vh"
      height={height}
      // height={400}
      // height="100%"
      // width={800}
      defaultLanguage={language}
      value={code}
      theme="vs-dark"
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
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
      }}
    />
  );
};

export default MonacoEditor;
