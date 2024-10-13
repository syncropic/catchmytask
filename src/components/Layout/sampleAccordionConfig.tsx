// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.

import {
  IconLanguage,
  IconSettings,
  IconSettingsAutomation,
} from "@tabler/icons-react";
import { AccordionSection } from "@components/interfaces";
import ActionInputWrapper from "@components/ActionInput";

export const sampleAccordionConfig: AccordionSection[] = [
  {
    key: "natural_language_query",
    title: "Query",
    icon: <IconLanguage size={16} />,
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
  {
    key: "automation_config",
    title: "Automation Config",
    icon: <IconSettingsAutomation size={16} />,
    Component: () => (
      <ActionInputWrapper
        name="automation_config"
        query_name="data_model"
        exclude_components={["input_mode", "submit_button"]}
        success_message_code="automation_action_input_data_model_schema"
        update_action_input_form_values_on_submit_success={true}
      />
    ),
  },
  {
    key: "session_config",
    title: "Session Config",
    icon: <IconSettings size={16} />,
    Component: ({ activeSession }) => (
      <ActionInputWrapper
        name="session_config"
        query_name="data_model"
        record={activeSession}
        exclude_components={["input_mode", "submit_button"]}
        success_message_code="session_action_input_data_model_schema"
        update_action_input_form_values_on_submit_success={true}
      />
    ),
  },
];
