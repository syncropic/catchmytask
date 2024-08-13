import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@mantine/core";

interface IEditor {
  value: any;
  language?: string;
  setFieldValue?: (field: string, value: any) => void;
  height?: string;
}

const MonacoEditor: React.FC<IEditor> = ({
  value,
  setFieldValue = () => {},
  language = "json",
  height = "30vh",
}) => {
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
    if (typeof value === "object") {
      setCode(JSON.stringify(value, null, 2));
    } else {
      setCode(value);
    }
  }, [value]);

  useEffect(() => {
    if (monaco) {
      // Additional Monaco setup if needed
    }
  }, [monaco]);

  function handleEditorDidMount() {
    // Editor mount logic
  }

  function handleEditorChange(value: string | undefined) {
    setFieldValue("query", value);
  }

  return (
    <Editor
      height={height}
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

export const MonacoEditorFormInput = ({ ...props }: any) => {
  console.log("monaco editor form input props", props);
  return (
    <>
      {props?.schema?.title && <Text>{props?.schema?.title}</Text>}
      <MonacoEditor
        {...props?.schema}
        value={props?.value}
        // setFieldValue={form.setFieldValue}
        // {...props}
      />
    </>
    // <div>monaco editor form input</div>
  );
};
