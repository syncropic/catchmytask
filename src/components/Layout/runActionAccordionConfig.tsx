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

export const runActionAccordionConfig: AccordionSection[] = [
  {
    key: "run",
    title: "run",
    icon: iconMap["run"]
      ? React.createElement(iconMap["run"], { size: 16 })
      : null,
    Component: ({ activeTask }) => (
      <ActionInputWrapper
        name={"save"}
        query_name="data_model"
        record={activeTask}
        action={"save"}
        success_message_code="action_input_data_model_schema"
      />
    ),
  },
];
