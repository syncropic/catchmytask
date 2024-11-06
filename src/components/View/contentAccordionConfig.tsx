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
import { stepsToMarkdown } from "@components/Utils";
import Markdown from "react-markdown";

export const contentAccordionConfig: AccordionSection[] = [
  {
    // key: "reasoning",
    // title: "thinking",
    // icon: iconMap["save"]
    //   ? React.createElement(iconMap["save"], { size: 16 })
    //   : null,
    Component: ({ content, language }) => (
      // <div>view query accordion </div>
      <div className="border-b border-gray-200">
        <div>
          {language === "markdown" ? (
            <Markdown className="prose prose-sm max-w-none break-words overflow-x-auto">
              {stepsToMarkdown(content)}
            </Markdown>
          ) : (
            <MonacoEditor value={content} language={language} height="15vh" />
          )}
        </div>
        {/* <div>action input</div> */}
        {/* <ActionInputWrapper
          name={"save"}
          query_name="data_model"
          record={{}}
          action={"save"}
          success_message_code="action_input_data_model_schema"
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
