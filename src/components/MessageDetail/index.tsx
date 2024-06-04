import MonacoEditor from "@components/MonacoEditor";
import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@mantine/core";

interface IEditor {
  value: any;
  language?: string;
}

const MessageDetail: React.FC<IEditor> = ({ value, language = "json" }) => {
  // console.log("value", value);
  // const monaco = useMonaco();
  // const editorRef = useRef(null);
  // const [code, setCode] = useState(() => {
  //   if (typeof value === "object") {
  //     return JSON.stringify(value, null, 2);
  //   } else {
  //     return value;
  //   }
  // });
  // useEffect(() => {
  //   if (monaco) {
  //     // console.log("here is the monaco instance:", monaco);
  //     // register autocompletions
  //     //   monaco.languages.registerCompletionItemProvider("javascript", {
  //     //     provideCompletionItems: async () => {
  //     //       // Get current cursor position
  //     //       const position = editorRef?.current.getPosition();
  //     //       // Get text before cursor
  //     //       const textBeforeCursor = editorRef?.current
  //     //         .getModel()
  //     //         .getValueInRange({
  //     //           startLineNumber: 1,
  //     //           startColumn: 1,
  //     //           endLineNumber: position.lineNumber,
  //     //           endColumn: position.column,
  //     //         });
  //     //       // // Call language model for autocomplete suggestions
  //     //       // const gpt3 = new GPT3({ apiKey: 'YOUR_API_KEY' });
  //     //       // const suggestions = await gpt3.completion({
  //     //       //   prompt: textBeforeCursor,
  //     //       //   maxTokens: 5, // Adjust max tokens as needed
  //     //       // });
  //     //       // const suggestions = handleGenerateCompletion(textBeforeCursor);
  //     //       let completions = ["first"];
  //     //       // Format suggestions for Monaco Editor
  //     //       const completionItems = completions.map((choice) => ({
  //     //         label: "text to insert label",
  //     //         kind: monaco.languages.CompletionItemKind.Keyword,
  //     //         insertText: "text to  insert",
  //     //       }));
  //     //       return {
  //     //         suggestions: completionItems,
  //     //       };
  //     //     },
  //     //   });
  //   }
  // }, [monaco]);

  // function handleEditorDidMount() {
  //   // console.log("onMount: the editor instance:", editor);
  //   //   console.log("onMount: the monaco instance:", monaco);
  //   //   editorRef.current = editor;
  // }

  // function handleEditorChange() {
  //   // console.log("here is the current model value:", value);
  //   // setFieldValue("query", value);
  //   // console.log("here is the current model value:", value);
  // }

  return (
    <div className="flex gap-4">
      <div>{value?.author}</div>
      <div>
        {/* <MonacoEditor
          value={value?.message?.code || value?.message}
          language={value?.language || "markdown"}
        /> */}
        <Text>{JSON.stringify(value?.message?.code || value?.message)}</Text>
      </div>
    </div>
  );
};

export default MessageDetail;
