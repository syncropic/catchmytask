import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useState, useRef } from "react";
import { Text } from "@mantine/core";
import { serializeBigInt } from "@components/Utils";

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
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorWidth, setEditorWidth] = useState<string>("100%");

  const [code, setCode] = useState(() => {
    return typeof value === "object"
      ? JSON.stringify(serializeBigInt(value), null, 2)
      : value;
  });

  useEffect(() => {
    if (typeof value === "object") {
      setCode(JSON.stringify(serializeBigInt(value), null, 2));
    } else {
      setCode(value);
    }
  }, [value]);

  // Add resize observer to handle container width changes
  useEffect(() => {
    if (!editorContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Force the editor to take full container width
        setEditorWidth(`${entry.contentRect.width}px`);
      }
    });

    resizeObserver.observe(editorContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function handleEditorDidMount(editor: any) {
    // Trigger layout update when editor mounts
    editor.layout();
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
    <div
      ref={editorContainerRef}
      style={{
        width: "100%",
        maxWidth: "100vw",
        overflow: "hidden",
      }}
    >
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
            enabled: window.innerWidth > 768, // Disable minimap on mobile
          },
          scrollbar: {
            horizontalSliderSize: 4,
            verticalSliderSize: 18,
            alwaysConsumeMouseWheel: false, // Better scrolling on mobile
          },
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: "line",
          automaticLayout: true,
          wordWrap: "on", // Enable word wrap for better mobile experience
          lineNumbers: window.innerWidth > 768 ? "on" : "off", // Disable line numbers on mobile to save space
        }}
        width={editorWidth}
      />
    </div>
  );
};

export default MonacoEditor;

export const MonacoEditorFormInput = ({ ...props }: any) => {
  return (
    <div style={{ width: "100%", maxWidth: "100vw" }}>
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
          props?.schema.title?.toLowerCase().replace(/ /g, "_") || props?.label
        }
      />
    </div>
  );
};

// import Editor, { useMonaco } from "@monaco-editor/react";
// import React, { useEffect, useRef, useState } from "react";
// import { Text } from "@mantine/core";
// import { serializeBigInt } from "@components/Utils";

// interface IEditor {
//   value: any;
//   language?: string;
//   setValue?: (value: any) => void;
//   height?: string;
//   field?: string;
// }

// interface Tables {
//   [tableName: string]: string[];
// }

// const MonacoEditor: React.FC<IEditor> = ({
//   value,
//   setValue = () => {},
//   language = "json",
//   height = "30vh",
//   field = "query",
// }) => {
//   const monaco = useMonaco();

//   const [code, setCode] = useState(() => {
//     return typeof value === "object"
//       ? JSON.stringify(serializeBigInt(value), null, 2)
//       : value;
//   });

//   useEffect(() => {
//     if (typeof value === "object") {
//       setCode(JSON.stringify(serializeBigInt(value), null, 2));
//     } else {
//       setCode(value);
//     }
//   }, [value]);

//   function handleEditorDidMount(editor: any) {}

//   function handleEditorChange(value: any) {
//     if (language === "json") {
//       try {
//         value = JSON.parse(value);
//       } catch (e) {
//         console.log("Error parsing JSON:", e);
//       }
//     }
//     setValue(value);
//   }

//   if (!monaco) {
//     return <div>Loading Monaco Editor...</div>;
//   }

//   return (
//     <>
//       <Editor
//         height={height}
//         defaultLanguage={language}
//         value={code}
//         theme="vs-dark"
//         onChange={handleEditorChange}
//         onMount={handleEditorDidMount}
//         options={{
//           autoIndent: "full",
//           contextmenu: true,
//           fontFamily: "monospace",
//           fontSize: 13,
//           lineHeight: 24,
//           hideCursorInOverviewRuler: true,
//           matchBrackets: "always",
//           minimap: { enabled: true },
//           scrollbar: { horizontalSliderSize: 4, verticalSliderSize: 18 },
//           selectOnLineNumbers: true,
//           roundedSelection: false,
//           readOnly: false,
//           cursorStyle: "line",
//           automaticLayout: true,
//         }}
//       />
//     </>
//   );
// };

// export default MonacoEditor;

// export const MonacoEditorFormInput = ({ ...props }: any) => {
//   return (
//     <>
//       {props?.schema?.title && (
//         <Text fw={500} size="sm">
//           {props?.schema?.title}
//         </Text>
//       )}
//       <MonacoEditor
//         {...props?.schema}
//         value={props?.value}
//         setValue={props?.onChange}
//         field={
//           props?.schema.title.toLowerCase().replace(/ /g, "_") || props?.label
//         }
//         // {...props}
//       />
//     </>
//   );
// };
