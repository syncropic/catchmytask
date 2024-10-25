import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import { Text } from "@mantine/core";
import { isAllLocalDBSuccess, serializeBigInt } from "@components/Utils";
import { useDuckDB } from "pages/_app";
import { useAppStore } from "src/store";

interface IEditor {
  value: any;
  language?: string;
  setValue?: (value: any) => void;
  height?: string;
  field?: string;
}

interface Tables {
  [tableName: string]: string[];
}

const MonacoEditor: React.FC<IEditor> = ({
  value,
  setValue = () => {},
  language = "json",
  height = "30vh",
  field = "query",
}) => {
  const monaco = useMonaco();
  const dbInstance = useDuckDB(); // Get the DuckDB instance from the context
  const { activeTask, selectedRecords, local_db } = useAppStore();
  const actionInputId =
    activeTask?.id || "b79aaba2-a0d1-4fa7-9b68-0baebbd1b321";
  const action_input_form_values_key = `plan_action_input_${actionInputId}`;
  const selectedActionSteps =
    selectedRecords[`${action_input_form_values_key}`];

  // const [tables, setTables] = useState({});
  // const tablesRef = useRef({}); // Store schema to avoid re-registering completion provider
  const [tables, setTables] = useState<Tables>({});
  const tablesRef = useRef<Tables>({}); // Store schema to avoid re-registering completion provider

  const allLocalDBSuccess = isAllLocalDBSuccess(local_db, selectedActionSteps);

  // Fetch tables and columns from DuckDB
  useEffect(() => {
    const fetchSchema = async () => {
      if (allLocalDBSuccess && selectedActionSteps && dbInstance) {
        try {
          const result = await dbInstance.query(`
            SELECT table_name, column_name 
            FROM information_schema.columns
          `);
          const schemaData = result.toArray();
          console.log(
            "Fetched schema data:",
            JSON.stringify(schemaData, null, 2)
          );

          const groupedTables = schemaData.reduce((acc: any, row: any) => {
            if (!acc[row.table_name]) {
              acc[row.table_name] = [];
            }
            acc[row.table_name].push(row.column_name);
            return acc;
          }, {});

          console.log(
            "Grouped tables with columns:",
            JSON.stringify(groupedTables, null, 2)
          );
          setTables(groupedTables);
          tablesRef.current = groupedTables; // Store schema in ref
        } catch (error) {
          console.error("Error fetching schema from DuckDB:", error);
        }
      }
    };

    fetchSchema();
  }, [selectedActionSteps, allLocalDBSuccess, dbInstance]);

  // Register the completion provider once
  useEffect(() => {
    if (monaco && Object.keys(tablesRef.current).length > 0) {
      const provider = monaco.languages.registerCompletionItemProvider("sql", {
        provideCompletionItems: (model: any, position: any) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: 1,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          console.log("Current query fragment:", textUntilPosition);

          const sqlKeywords = [
            "SELECT",
            "FROM",
            "WHERE",
            "JOIN",
            "GROUP BY",
            "ORDER BY",
          ];

          // Case 1: Suggest columns for a specific table after "SELECT" if the "FROM <table>" exists
          const tableNameMatch = /FROM\s+(\w+)/i.exec(textUntilPosition);
          if (tableNameMatch) {
            const tableName = tableNameMatch[1];
            console.log("Matching table for columns:", tableName);

            if (textUntilPosition.toUpperCase().includes("SELECT")) {
              const columnSuggestions = (
                tablesRef.current[tableName] || []
              ).map((column) => ({
                label: column,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: column,
              }));
              console.log(
                "Column suggestions for",
                tableName,
                ":",
                JSON.stringify(columnSuggestions, null, 2)
              );
              return { suggestions: columnSuggestions };
            }
          }

          // Case 2: Suggest tables after "FROM"
          if (textUntilPosition.toUpperCase().includes("FROM ")) {
            const tableSuggestions = Object.keys(tablesRef.current).map(
              (table) => ({
                label: table,
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: table,
              })
            );
            console.log(
              "Table suggestions:",
              JSON.stringify(tableSuggestions, null, 2)
            );
            return { suggestions: tableSuggestions };
          }

          // Case 3: Suggest all columns from all tables if no table has been specified yet
          if (
            textUntilPosition.toUpperCase().includes("SELECT") &&
            !tableNameMatch
          ) {
            const allColumns = Object.keys(tablesRef.current).flatMap((table) =>
              tablesRef.current[table].map((column) => ({
                label: column,
                kind: monaco.languages.CompletionItemKind.Variable,
                insertText: column,
                detail: `Column from ${table}`,
              }))
            );
            console.log(
              "All column suggestions:",
              JSON.stringify(allColumns, null, 2)
            );
            return { suggestions: allColumns };
          }

          // Default SQL keyword suggestions
          const keywordSuggestions = sqlKeywords.map((keyword) => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
          }));

          return { suggestions: keywordSuggestions };
        },
      });

      return () => provider.dispose(); // Clean up on unmount
    }
  }, [monaco, tablesRef.current]);

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

  function handleEditorDidMount(editor: any) {}

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
    <>
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
          minimap: { enabled: true },
          scrollbar: { horizontalSliderSize: 4, verticalSliderSize: 18 },
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: "line",
          automaticLayout: true,
        }}
      />
    </>
  );
};

export default MonacoEditor;

export const MonacoEditorFormInput = ({ ...props }: any) => {
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
