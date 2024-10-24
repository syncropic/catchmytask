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

export const actionAccordionConfig: AccordionSection[] = [
  {
    // key: "save",
    // title: "Save",
    // icon: iconMap["save"]
    //   ? React.createElement(iconMap["save"], { size: 16 })
    //   : null,
    Component: ({ record, action }) => (
      <ActionInputWrapper
        name={action}
        query_name="data_model"
        record={record}
        action={action}
        success_message_code="action_input_data_model_schema"
      />
    ),
  },
];
