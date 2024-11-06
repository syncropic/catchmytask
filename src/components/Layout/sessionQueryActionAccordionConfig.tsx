// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.
import { AccordionSection } from "@components/interfaces";
import ActionInputWrapper from "@components/ActionInput";
import { iconMap } from "@components/Utils";
import React from "react";
import AccordionHeader from "@components/AccordionHeader";
// import AccordionComponent from "@components/AccordionComponent";
// import { saveActionAccordionConfig } from "./saveActionAccordionConfig";
// import { actionAccordionConfig } from "./actionAccordionConfig";

export const sessionQueryActionAccordionConfig: AccordionSection[] = [
  {
    key: "session_query",
    title: <AccordionHeader name="session_query" entity_type="sessionss" />,
    Component: ({ activeSession, action }) => (
      <>
        {/* {action === "save" && (
          <AccordionComponent
            sections={actionAccordionConfig}
            defaultExpandedValues={[action]}
            action={action}
            record={activeView}
          />
        )} */}
        {/* {action === "upload" && (
          <AccordionComponent
            sections={actionAccordionConfig}
            defaultExpandedValues={[action]}
            action={action}
            record={activeView}
          />
        )} */}
        {/* {activeView?.["action_models"]?.["query"]} */}
        <ActionInputWrapper
          // name={activeSession?.["action_models"]?.["query"]} # improve later
          name="user proxy"
          query_name="data_model"
          record={{ ...activeSession }}
          action={"query"}
          success_message_code="action_input_data_model_schema"
        />
      </>
    ),
  },
];
