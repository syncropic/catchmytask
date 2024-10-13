// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.

import {
  IconLanguage,
  IconSettings,
  IconSettingsAutomation,
} from "@tabler/icons-react";
import { AccordionSection } from "@components/interfaces";
import ActionInputWrapper from "@components/ActionInput";
import { iconMap } from "@components/Utils";
import React from "react";

export const searchAccordionConfig: AccordionSection[] = [
  {
    key: "search",
    title: "Search",
    icon: iconMap["search"]
      ? React.createElement(iconMap["search"], { size: 16 })
      : null,
    Component: ({ activeTask }) => (
      <ActionInputWrapper
        name="task"
        query_name="data_model"
        record={activeTask}
        exclude_components={["input_mode", "submit_button"]}
        success_message_code="action_input_data_model_schema"
        update_action_input_form_values_on_submit_success={true}
        nested_component={{ data_model: { name: "task_config" } }}
        endpoint="plan"
        action_label="Catch"
      />
    ),
  },
];
