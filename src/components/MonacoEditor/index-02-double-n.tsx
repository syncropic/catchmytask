import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useState, useRef } from "react";
import { Text } from "@mantine/core";
import { serializeBigInt } from "@components/Utils";

const stringifyYamlForOutput = (value: string) => {
  if (typeof value !== "string") return value;

  // Remove any existing escapes first
  let processed = value
    .replace(/\\\\/g, "\\")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\n/g, "\n");

  // Now convert to single-line format with proper escaping
  return processed
    .split("\n")
    .map((line) => {
      // Preserve exact indentation
      const match = line.match(/^(\s*)(.*)/);
      if (!match) return line;

      const [, spaces, content] = match;
      return spaces + content;
    })
    .join("\n") // Join with actual newlines first
    .replace(/\n/g, "\\n") // Then convert to escaped newlines
    .replace(/(?<!\\)"/g, '"') // Don't escape quotes again
    .trim();
};

// The normalizeYamlString function remains the same
const normalizeYamlString = (value: string) => {
  if (typeof value !== "string") return value;

  // First handle double-escaped newlines (\\n)
  let normalized = value.replace(/\\\\n/g, "\n");

  // Then handle single-escaped newlines (\n)
  normalized = normalized.replace(/\\n/g, "\n");

  // Handle escaped quotes
  normalized = normalized.replace(/\\"/g, '"').replace(/\\'/g, "'");

  // Process line by line for precise indentation
  normalized = normalized
    .split("\n")
    .map((line) => {
      const match = line.match(/^(\s*)(.*)/);
      if (!match) return line;

      const [, spaces, content] = match;
      const indentLevel = Math.floor((spaces.length + 2) / 4);
      const correctIndent = " ".repeat(indentLevel * 4);

      return correctIndent + content.trimLeft();
    })
    .join("\n");

  return normalized;
};

const editorCounter = { current: 0 };

const generateEditorId = (base: string = "monaco-editor") => {
  editorCounter.current += 1;
  return `${base}-${editorCounter.current}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;
};

interface IEditor {
  value: any;
  language?: string;
  setValue?: (value: any) => void;
  height?: string;
  field?: string;
  id?: string;
  isDarkMode?: boolean;
}

const MonacoEditor: React.FC<IEditor> = ({
  value,
  setValue = () => {},
  language = "json",
  height = "60vh",
  field = "query",
  id: providedId,
  isDarkMode = true,
}) => {
  const monaco = useMonaco();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const [editorWidth, setEditorWidth] = useState<string>("100%");
  const editorId = useRef(providedId || generateEditorId(field));
  const uniqueContextKeyRef = useRef(`editor-${editorId.current}-hasFocus`);

  useEffect(() => {
    if (monaco) {
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

      monaco.editor.defineTheme("vs-light-custom", {
        base: "vs",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#ffffff",
          "editor.foreground": "#000000",
          "editor.lineHighlightBackground": "#f0f0f0",
          "editorLineNumber.foreground": "#999999",
          "editor.selectionBackground": "#add6ff",
          "editorIndentGuide.background": "#d3d3d3",
          "editor.lineHighlightBorder": "#e8e8e8",
        },
      });

      monaco.editor.defineTheme("vs-dark-custom", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
          "editor.background": "#1e1e1e",
          "editor.foreground": "#d4d4d4",
          "editor.lineHighlightBackground": "#2d2d2d",
          "editorLineNumber.foreground": "#858585",
          "editor.selectionBackground": "#264f78",
          "editorIndentGuide.background": "#404040",
          "editor.lineHighlightBorder": "#2d2d2d",
        },
      });
    }
  }, [monaco]);

  // const [code, setCode] = useState(() => {
  //   return typeof value === "object"
  //     ? JSON.stringify(serializeBigInt(value), null, 2)
  //     : value;
  // });

  const [code, setCode] = useState(() => {
    if (language === "yaml") {
      return normalizeYamlString(value);
    }
    return typeof value === "object"
      ? JSON.stringify(serializeBigInt(value), null, 2)
      : value;
  });

  // useEffect(() => {
  //   if (typeof value === "object") {
  //     setCode(JSON.stringify(serializeBigInt(value), null, 2));
  //   } else {
  //     setCode(value);
  //   }
  // }, [value]);

  useEffect(() => {
    if (language === "yaml") {
      setCode(normalizeYamlString(value));
    } else if (typeof value === "object") {
      setCode(JSON.stringify(serializeBigInt(value), null, 2));
    } else {
      setCode(value);
    }
  }, [value, language]);

  useEffect(() => {
    if (!editorContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setEditorWidth(`${entry.contentRect.width}px`);
      }
    });

    resizeObserver.observe(editorContainerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (monaco && editorRef.current) {
      const editor = editorRef.current;

      // Create unique context key for this specific editor instance
      const contextKey = editor.createContextKey(
        uniqueContextKeyRef.current,
        false
      );

      // Set up focus tracking for this specific instance
      const focusDisposable = editor.onDidFocusEditorWidget(() =>
        contextKey.set(true)
      );
      const blurDisposable = editor.onDidBlurEditorWidget(() =>
        contextKey.set(false)
      );

      // Register command with instance-specific context
      const commandId = `comment-line-${editorId.current}`;
      const commandDisposable = editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash,
        () => {
          editor.trigger("keyboard", "editor.action.commentLine", null);
        },
        `!!${uniqueContextKeyRef.current}`
      );

      return () => {
        focusDisposable.dispose();
        blurDisposable.dispose();
        if (commandDisposable) {
          commandDisposable.dispose();
        }
        contextKey.dispose();
      };
    }
  }, [monaco]);

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;
    editor.layout();

    const theme = isDarkMode ? "vs-dark-custom" : "vs-light-custom";
    monaco?.editor.setTheme(theme);
  }

  useEffect(() => {
    if (monaco && editorRef.current) {
      const theme = isDarkMode ? "vs-dark-custom" : "vs-light-custom";
      monaco.editor.setTheme(theme);
    }
  }, [isDarkMode, monaco]);

  // function handleEditorChange(value: any) {
  //   if (language === "json") {
  //     try {
  //       value = JSON.parse(value);
  //     } catch (e) {
  //       console.log("Error parsing JSON:", e);
  //     }
  //   }
  //   setValue(value);
  // }

  function handleEditorChange(value: any) {
    if (language === "json") {
      try {
        value = JSON.parse(value);
      } catch (e) {
        console.log("Error parsing JSON:", e);
      }
      setValue(value);
    } else if (language === "yaml") {
      // Convert the edited YAML back to the expected format
      setValue(stringifyYamlForOutput(value));
    } else {
      setValue(value);
    }
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
        borderRadius: "8px",
        boxShadow: isDarkMode
          ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
          : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
      data-editor-id={editorId.current}
    >
      <div
        style={{
          borderRadius: "8px",
          overflow: "hidden",
          border: isDarkMode ? "1px solid #2d2d2d" : "1px solid #e5e7eb",
        }}
      >
        <Editor
          height={height}
          defaultLanguage={language}
          value={code}
          theme={isDarkMode ? "vs-dark-custom" : "vs-light-custom"}
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
            overviewRulerBorder: false,
            renderLineHighlight: "all",
            scrollBeyondLastLine: false,
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
    </div>
  );
};

export default MonacoEditor;

export const MonacoEditorFormInput = ({ isDarkMode = true, ...props }: any) => {
  return (
    <div style={{ width: "100%", maxWidth: "100vw" }}>
      {props?.title && <div>{props?.title}</div>}
      {/* {props?.value} */}
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
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
