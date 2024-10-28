// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.
import { AccordionSection } from "@components/interfaces";
import ActionInputWrapper from "@components/ActionInput";
import { iconMap } from "@components/Utils";
import React from "react";
import AccordionHeader from "@components/AccordionHeader";
import AccordionComponent from "@components/AccordionComponent";
import { saveActionAccordionConfig } from "./saveActionAccordionConfig";
import { actionAccordionConfig } from "./actionAccordionConfig";

export const viewQueryActionAccordionConfig: AccordionSection[] = [
  {
    key: "query",
    title: <AccordionHeader name="query" entity_type="views" />,
    Component: ({ activeView, action }) => (
      <>
        {action === "save" && (
          <AccordionComponent
            sections={actionAccordionConfig}
            defaultExpandedValues={[action]}
            action={action}
            record={activeView}
          />
        )}
        {action === "upload" && (
          <AccordionComponent
            sections={actionAccordionConfig}
            defaultExpandedValues={[action]}
            action={action}
            record={activeView}
          />
        )}
        {/* {activeView?.["action_models"]?.["query"]} */}
        <ActionInputWrapper
          name={activeView?.["action_models"]?.["query"]}
          query_name="data_model"
          record={{ ...activeView }}
          action={"query"}
          success_message_code="action_input_data_model_schema"
        />
      </>
    ),
  },
];
