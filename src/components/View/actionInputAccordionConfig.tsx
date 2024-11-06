// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.

// import {
//   IconLanguage,
//   IconSettings,
//   IconSettingsAutomation,
// } from "@tabler/icons-react";
import { AccordionSection } from "@components/interfaces";
import ActionInputWrapper from "@components/ActionInput";
// import { iconMap } from "@components/Utils";
import React from "react";
import MonacoEditor from "@components/MonacoEditor";

export const actionInputAccordionConfig: AccordionSection[] = [
  {
    key: "input",
    title: "input",
    // icon: iconMap["save"]
    //   ? React.createElement(iconMap["save"], { size: 16 })
    //   : null,
    Component: ({ globalQuery }) => (
      // <div>view query accordion </div>
      <div className="border-b border-gray-200">
        {/* <div>action input</div> */}
        <ActionInputWrapper
          name={"save"}
          query_name="data_model"
          record={{}}
          action={"save"}
          success_message_code="action_input_data_model_schema"
        />
        {/* <MonacoEditor
          value={globalQuery}
          language="python"
          height="10vh"
          // options={{
          //   minimap: { enabled: false },
          //   scrollBeyondLastLine: false,
          //   fontSize: 14,
          //   lineNumbers: "on",
          // }}
        /> */}
      </div>
      // <ActionInputWrapper
      //   name={action}
      //   query_name="data_model"
      //   record={record}
      //   action={action}
      //   success_message_code="action_input_data_model_schema"
      // />
    ),
  },
];
