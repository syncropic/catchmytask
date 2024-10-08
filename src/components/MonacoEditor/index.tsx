import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@mantine/core";

interface IEditor {
  value: any;
  language?: string;
  setValue?: (value: any) => void;
  height?: string;
  field?: string;
}

const MonacoEditor: React.FC<IEditor> = ({
  value,
  setValue = () => {},
  language = "json",
  height = "30vh",
  field = "query",
}) => {
  const monaco = useMonaco();
  // useEffect(() => {
  //   if (monaco) {
  //     // Define a custom theme based on `vs-dark` with a slightly lighter background
  //     monaco.editor.defineTheme("darkGrayTheme", {
  //       base: "vs-dark", // Using the 'vs-dark' theme as the base
  //       inherit: true, // Inherit default vs-dark rules
  //       rules: [], // No changes to syntax highlighting rules
  //       colors: {
  //         "editor.background": "#2e2e2e", // Dark gray background (slightly lighter than vs-dark)
  //       },
  //     });

  //     // Set the new theme
  //     monaco.editor.setTheme("darkGrayTheme");
  //   }
  // }, [monaco]);
  const [code, setCode] = useState(() => {
    return typeof value === "object" ? JSON.stringify(value, null, 2) : value;
  });

  useEffect(() => {
    if (typeof value === "object") {
      setCode(JSON.stringify(value, null, 2));
    } else {
      setCode(value);
    }
  }, [value]);

  function handleEditorDidMount(editor: any) {
    // Ensure the monaco instance is available before binding commands
    // if (!monaco) {
    //   return;
    // }
    // Define keys that should stop propagation but still be handled by Monaco
    // const commonKeys = [
    //   monaco.KeyCode.Backspace,
    //   monaco.KeyCode.Space,
    //   monaco.KeyCode.Tab,
    //   monaco.KeyCode.Enter,
    // ];
    // Bind the commands to the editor
    // commonKeys.forEach((keyCode) => {
    //   editor.addCommand(keyCode, function () {
    //     // Let Monaco handle the key, but prevent the event from bubbling to parent
    //     console.log(
    //       `Key with keyCode ${keyCode} pressed, stopping propagation.`
    //     );
    //     // Note: No need for e.preventDefault() to avoid stopping default Monaco behavior
    //   });
    // });
    // Also use the regular event system to stop propagation of other events
    // editor.onKeyDown((e: any) => {
    //   if (commonKeys.includes(e.keyCode)) {
    //     e.stopPropagation(); // Stop event from propagating
    //     console.log(
    //       `Key with keyCode ${e.keyCode} pressed, stopping propagation.`
    //     );
    //   }
    // });
    // Stop propagation for mouse click events
    // editor.onMouseDown((e: any) => {
    //   e.event.stopPropagation(); // Stop mouse event from propagating
    //   console.log("Mouse down, stopping propagation.");
    // });
  }

  function handleEditorChange(value: any) {
    if (language === "json") {
      try {
        value = JSON.parse(value);
      } catch (e) {
        console.log("Error parsing JSON:", e);
      }
    }
    setValue(value);
  }

  if (!monaco) {
    return <div>Loading Monaco Editor...</div>;
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
  // console.log("monaco editor form input props", props);
  // const setValue = (value: any) => {
  //   props?.setFieldValue(
  //     props?.schema.title.toLowerCase().replace(/ /g, "_"),
  //     value
  //   );
  // };
  return (
    <>
      {props?.schema?.title && (
        <Text fw={500} size="sm">
          {props?.schema?.title}
        </Text>
      )}
      <MonacoEditor
        {...props?.schema}
        value={props?.value}
        setValue={props?.onChange}
        field={
          props?.schema.title.toLowerCase().replace(/ /g, "_") || props?.label
        }
        // {...props}
      />
    </>
    // <div>monaco editor form input</div>
  );
};
