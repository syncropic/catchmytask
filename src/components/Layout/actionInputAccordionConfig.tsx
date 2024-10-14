// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.

import { AccordionSection } from "@components/interfaces";
import { iconMap } from "@components/Utils";
import React from "react";
import PlanWrapper from "@components/Plan";
import PinnedActionStepResults from "@components/PinnedActionStepResults";
import ActionInputWrapper from "@components/ActionInput";

export const actionInputAccordionConfig: AccordionSection[] = [
  {
    key: "action_input",
    title: "action_input",
    icon: iconMap["action_input"]
      ? React.createElement(iconMap["action_input"], { size: 16 })
      : null,
    Component: ({ activeTask, selectedRecords, action }) => (
      <div>
        <div className="w-full">
          <ActionInputWrapper
            name={action}
            query_name="data_model"
            record={activeTask}
            action={action}
            success_message_code="action_input_data_model_schema"
          />
        </div>
      </div>
    ),
  },
];
