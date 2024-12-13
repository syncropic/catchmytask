import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useState, useRef } from "react";
import { Text } from "@mantine/core";
import { serializeBigInt } from "@components/Utils";
// import { registerNSTL } from "./nstlLanguage";

const editorCounter = { current: 0 };

const generateEditorId = (base: string = "monaco-editor") => {
  editorCounter.current += 1;
  return `${base}-${editorCounter.current}`;
};

interface IEditor {
  value: any;
  language?: string;
  setValue?: (value: any) => void;
  height?: string;
  field?: string;
  id?: string;
}

const MonacoEditor: React.FC<IEditor> = ({
  value,
  setValue = () => {},
  language = "json",
  height = "60vh",
  field = "query",
  id: providedId,
}) => {
  const monaco = useMonaco();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const [editorWidth, setEditorWidth] = useState<string>("100%");
  const editorId = useRef(providedId || generateEditorId(field));

  useEffect(() => {
    if (monaco) {
      // registerNSTL(monaco);

      monaco.languages.register({ id: "yaml" });

      monaco.languages.setMonarchTokensProvider("yaml", {
        defaultToken: "",
        tokenPostfix: ".yaml",

        brackets: [
          { open: "{", close: "}", token: "delimiter.bracket" },
          { open: "[", close: "]", token: "delimiter.square" },
          { open: "(", close: ")", token: "delimiter.parenthesis" },
        ],

        keywords: ["true", "false", "null", "on", "off"],

        tokenizer: {
          root: [
            { include: "@whitespace" },
            { include: "@numbers" },
            { include: "@strings" },
            [/([^,\{\[\}\]\s]+)(\s*)(:)/, ["key", "white", "delimiter"]],
            [/\-\s+/, "operators"],
            [/[{}\[\]()]/, "@brackets"],
            [/#.*$/, "comment"],
          ],

          whitespace: [[/\s+/, "white"]],

          numbers: [
            [/-?\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
            [/-?\d+/, "number"],
          ],

          strings: [
            [/'([^'\\]|\\.)*$/, "string.invalid"],
            [/'/, "string", "@stringBody"],
            [/"([^"\\]|\\.)*$/, "string.invalid"],
            [/"/, "string", "@dblStringBody"],
          ],

          stringBody: [
            [/[^\\']+/, "string"],
            [/'/, "string", "@pop"],
            [/./, "string"],
          ],

          dblStringBody: [
            [/[^\\"]+/, "string"],
            [/"/, "string", "@pop"],
            [/./, "string"],
          ],
        },
      });

      monaco.languages.setLanguageConfiguration("yaml", {
        comments: {
          lineComment: "#",
        },
        brackets: [
          ["{", "}"],
          ["[", "]"],
          ["(", ")"],
        ],
        autoClosingPairs: [
          { open: "{", close: "}" },
          { open: "[", close: "]" },
          { open: "(", close: ")" },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
        surroundingPairs: [
          { open: "{", close: "}" },
          { open: "[", close: "]" },
          { open: "(", close: ")" },
          { open: '"', close: '"' },
          { open: "'", close: "'" },
        ],
        folding: {
          offSide: true,
        },
        indentationRules: {
          increaseIndentPattern:
            /^\s*.*(:|\[|\{|\b(if|while|for|class|def)\b).*$/,
          decreaseIndentPattern: /^\s*}$/,
        },
      });
    }
  }, [monaco]);

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

  useEffect(() => {
    if (!editorContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setEditorWidth(`${entry.contentRect.width}px`);
      }
    });

    resizeObserver.observe(editorContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
    editor.layout();

    const contextKey = `${editorId.current}-hasFocus`;
    const editorContext = editor.createContextKey(contextKey, false);

    editor.onDidFocusEditorWidget(() => editorContext.set(true));
    editor.onDidBlurEditorWidget(() => editorContext.set(false));

    editor.addCommand(
      monaco?.KeyMod.CtrlCmd | monaco?.KeyCode.Slash,
      () => {
        editor.trigger("keyboard", "editor.action.commentLine", null);
      },
      `!!${contextKey}`
    );
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
      data-editor-id={editorId.current}
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
            enabled: window.innerWidth > 768,
          },
          scrollbar: {
            horizontalSliderSize: 4,
            verticalSliderSize: 18,
            alwaysConsumeMouseWheel: false,
          },
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: "line",
          automaticLayout: true,
          wordWrap: "on",
          lineNumbers: window.innerWidth > 768 ? "on" : "off",
          ...(language === "nstl"
            ? {
                wordBasedSuggestions: true,
                suggestOnTriggerCharacters: true,
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false,
                },
                snippetSuggestions: "inline",
              }
            : {}),
          ...(language === "yaml"
            ? {
                tabSize: 2,
                insertSpaces: true,
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: false,
                },
                folding: true,
                foldingStrategy: "indentation",
              }
            : {}),
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
      <MonacoEditor
        {...props?.schema}
        value={props?.value}
        setValue={props?.onChange}
        field={
          props?.schema.title?.toLowerCase().replace(/ /g, "_") || props?.label
        }
        id={`${props?.action_input_form_values_key}_${
          props?.schema.title?.toLowerCase().replace(/ /g, "_") || props?.label
        }`}
        {...props}
        language={props?.language || "json"}
      />
    </div>
  );
};
