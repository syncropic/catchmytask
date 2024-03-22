import { IFieldConfigurationWithValue } from "@components/interfaces";
import React from "react";

const IframeView: React.FC<IFieldConfigurationWithValue> = ({
  value,
  display_format,
  display_component,
  display_component_content,
}) => {
  let full_file_path = "";
  let getFilePath = "";
  // if (activeActionOption?.name === "view_file") {
  //   const file_path = activeRecords[0]?.file_path;
  //   const applicationsIndex =
  //     file_path?.indexOf("applications/") + "applications/".length; // Add length to skip "applications/"
  //   getFilePath = file_path?.substring(applicationsIndex);
  //   full_file_path = `http://localhost:8443/??folder=/config&payload=[["openFile","vscode-remote:///config/${getFilePath}"]]`;
  // }
  // const file_path = activeRecords[0]?.file_path;
  const applicationsIndex =
    value?.indexOf("applications/") + "applications/".length; // Add length to skip "applications/"
  getFilePath = value?.substring(applicationsIndex);
  full_file_path = `http://localhost:8443/??folder=/config&payload=[["openFile","vscode-remote:///config/${getFilePath}"]]`;

  console.log("file_path", value);

  return (
    <>
      <div>File: {getFilePath}</div>

      <iframe
        style={{ border: "none" }}
        title="Code Server"
        src={full_file_path}
        width="100%"
        height="500px"
      ></iframe>
    </>
  );
};

export default IframeView;
