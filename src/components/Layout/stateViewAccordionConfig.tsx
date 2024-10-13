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
import StateView from "@components/StateView";
import Breadcrumbs from "@components/Breadcrumbs";

export const stateViewAccordionConfig: AccordionSection[] = [
  {
    key: "state",
    title: <Breadcrumbs />,
    icon: iconMap["state"]
      ? React.createElement(iconMap["state"], { size: 16 })
      : null,
    Component: ({ activeTask }) => <StateView />,
  },
];
