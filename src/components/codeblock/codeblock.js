import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/cjs/styles/prism";

const CodeBlock = ({ jsonData }) => {
  // Convert JSON object to string with 2-space indentation
  const formattedJson = JSON.stringify(jsonData, null, 2);

  return (
    <SyntaxHighlighter language="json" style={dark}>
      {formattedJson}
    </SyntaxHighlighter>
  );
};

export default CodeBlock;
