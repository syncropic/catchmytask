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

export const executeActionAccordionConfig: AccordionSection[] = [
  {
    key: "execute",
    title: "execute",
    icon: iconMap["execute"]
      ? React.createElement(iconMap["execute"], { size: 16 })
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
