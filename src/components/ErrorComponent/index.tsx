// ErrorComponent.ts
// This component is responsible for rendering error messages when there's an issue with fetching or processing data.

import React from "react";
import MonacoEditor from "@components/MonacoEditor";

const ErrorComponent = ({
  error,
  component,
}: {
  error: any;
  component: string;
}) => (
  <MonacoEditor
    value={{
      data: error?.response?.data,
      status: error?.response?.status,
      component: component,
    }}
    language="json"
    height="25vh"
  />
);

export default ErrorComponent;
