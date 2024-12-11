// nstlLanguage.ts
export const registerNSTL = (monaco: any) => {
  // Register a new language
  monaco.languages.register({ id: "nstl" });

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider("nstl", {
    defaultToken: "",
    tokenPostfix: ".nstl",

    // Expanded keywords to support comprehensive task structure
    keywords: [
      // Task Definition
      "define",
      "task",
      "as",

      // Resource Management
      "requires",
      "rate_limit",
      "timeout",
      "connection_pool",
      "retry_window",
      "quota_exceeded_wait",
      "resources",

      // Monitoring and Control
      "monitor",
      "metrics",
      "alerts",
      "logging",
      "track",
      "progress",
      "notify_on",
      "when",
      "notify",

      // Main Operational Keywords
      "repeat",
      "fetch",
      "process",
      "upsert",
      "update",
      "transform",

      // Data Operations
      "from",
      "where",
      "using",
      "merge",
      "join",
      "select",
      "group",
      "by",
      "order",
      "limit",
      "as",
      "set",
      "compute",
      "validate",

      // Control Flow
      "if",
      "then",
      "else",
      "for",
      "each",
      "in",
      "stop",
      "continue",
      "skip",
      "break",
      "return",

      // Error Handling
      "on",
      "error",
      "retry",
      "attempts",
      "backoff",
      "then",
      "catch",
      "finally",
      "throw",

      // Validation and Conditions
      "required",
      "ensure",
      "between",
      "in",
      "is",
      "not",
      "null",
      "and",
      "or",
      "exists",
      "match",
      "validate",

      // Time and Duration
      "interval",
      "seconds",
      "minutes",
      "hours",
      "days",

      // Cleanup and Finalization
      "cleanup",
      "finally",
      "success",
      "options",
    ],

    // Time units and special constants
    constants: [
      "null",
      "true",
      "false",
      "pending",
      "active",
      "completed",
      "failed",
      "now",
      "today",
      "exponential",
      "linear",
      "info",
      "warn",
      "error",
    ],

    // Operators including SQL-style operators
    operators: [
      ">",
      "<",
      ">=",
      "<=",
      "=",
      "<>",
      "!=",
      "is",
      "contains",
      "and",
      "or",
      "not",
      "in",
      "between",
      "like",
      "+",
      "-",
      "*",
      "/",
      "%",
    ],

    // Symbols and delimiters
    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    // String escape sequences
    escapes:
      /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // Tokenizer rules
    tokenizer: {
      root: [
        // Comments
        [/\/\/.*$/, "comment"], // Single-line comments
        [/--.*$/, "comment"], // SQL-style comments
        [/\/\*/, "comment", "@comment"], // Multi-line comments

        // Special variables
        [/\$[\w]+/, "variable"], // $variable references
        [/:[\w]+/, "parameter"], // :parameter references

        // Numbers
        [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
        [/\d+/, "number"],

        // Identifiers and keywords
        [
          /[a-zA-Z_][\w]*/,
          {
            cases: {
              "@keywords": "keyword",
              "@constants": "constant",
              "@operators": "operator",
              "@default": "identifier",
            },
          },
        ],

        // Strings
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
        [/'([^'\\]|\\.)*$/, "string.invalid"],
        [
          /'/,
          { token: "string.quote", bracket: "@open", next: "@string_single" },
        ],

        // Delimiters
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [
          /@symbols/,
          {
            cases: {
              "@operators": "operator",
              "@default": "",
            },
          },
        ],

        // Whitespace
        [/\s+/, "white"],
      ],

      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],

      string: [
        [/[^\\"]+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],

      string_single: [
        [/[^\\']+/, "string"],
        [/@escapes/, "string.escape"],
        [/\\./, "string.escape.invalid"],
        [/'/, { token: "string.quote", bracket: "@close", next: "@pop" }],
      ],
    },
  });

  // Enhanced completion provider
  monaco.languages.registerCompletionItemProvider("nstl", {
    provideCompletionItems: (model: any, position: any) => {
      const suggestions = [
        // Basic task structure
        {
          label: "define task",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'define task "${1:taskName}" as:',
            "    repeat:",
            "        fetch:",
            "            ${2:data}:",
            "                from: ${3:source}",
            "                where: ${4:condition}",
            "        ",
            "        stop when:",
            "            ${5:condition}",
            "        ",
            "        options:",
            "            batch_size: ${6:100}",
            "            max_tries: ${7:1000}",
            "            pause: ${8:1s}",
          ].join("\n"),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: "Create a new repeating task definition",
        },

        // Fetch block
        {
          label: "fetch block",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "fetch:",
            "    ${1:name}:",
            "        from: ${2:source}",
            "        where: ${3:condition}",
            "        validate:",
            "            required: [${4:fields}]",
            "        on error:",
            "            retry: ${5:3} times",
            "",
          ].join("\n"),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },

        // Upsert block
        {
          label: "upsert block",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "upsert:",
            "    target: ${1:table}",
            "    data: ${2:$source}",
            "    match_on: ${3:id}",
            "    set:",
            "        ${4:field} = ${5:value}",
            "    on error:",
            "        retry: 3 times",
            "",
          ].join("\n"),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },

        // Error handling block
        {
          label: "error handling",
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            "on error:",
            "    retry:",
            "        attempts: ${1:3}",
            "        backoff: ${2:exponential}",
            "        max_delay: ${3:30s}",
            "    then:",
            "        ${4:action}",
            "",
          ].join("\n"),
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        },
      ];

      return { suggestions };
    },
  });

  // Enhanced theme with more token types
  monaco.editor.defineTheme("nstl-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
      { token: "variable", foreground: "9CDCFE" },
      { token: "parameter", foreground: "4FC1FF" },
      { token: "string", foreground: "CE9178" },
      { token: "comment", foreground: "6A9955" },
      { token: "number", foreground: "B5CEA8" },
      { token: "operator", foreground: "D4D4D4" },
      { token: "constant", foreground: "4EC9B0" },
      { token: "type", foreground: "4EC9B0" },
      { token: "bracket", foreground: "D4D4D4" },
    ],
    colors: {
      "editor.foreground": "#D4D4D4",
      "editor.background": "#1E1E1E",
      "editor.selectionBackground": "#264F78",
      "editor.lineHighlightBackground": "#2A2D2E",
      "editorCursor.foreground": "#AEAFAD",
      "editorWhitespace.foreground": "#404040",
    },
  });
};
