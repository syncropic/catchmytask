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

export const viewSearchActionAccordionConfig: AccordionSection[] = [
  {
    key: "search",
    title: <AccordionHeader name="search" entity_type="views" />,
    Component: ({ activeView, activeTask, action }) => (
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
        {/* {activeView?.["action_models"]?.["search"]} */}
        <ActionInputWrapper
          name={activeView?.["action_models"]?.["search"]}
          query_name="data_model"
          record={{ ...activeView }}
          action={"search"}
          success_message_code="action_input_data_model_schema"
        />
      </>
    ),
  },
];
