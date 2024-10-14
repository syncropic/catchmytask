// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.

import { AccordionSection } from "@components/interfaces";
import ActionInputWrapper from "@components/ActionInput";
import { iconMap } from "@components/Utils";
import React from "react";
import StateView from "@components/StateView";
import Breadcrumbs from "@components/Breadcrumbs";
import PlanWrapper from "@components/Plan";

export const planViewAccordionConfig: AccordionSection[] = [
  {
    key: "plan",
    title: "Plan",
    icon: iconMap["plan"]
      ? React.createElement(iconMap["plan"], { size: 16 })
      : null,
    Component: ({ activeTask }) => (
      <div>
        {activeTask ? (
          <div className="w-full">
            {" "}
            <PlanWrapper
              name="list items"
              query_name="data_model"
              record={activeTask}
              action={"plan"}
              success_message_code="action_input_data_model_schema"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center p-4">
            <p className="text-sm text-gray-600 text-center">
              Action plan appears here.
            </p>
          </div>
        )}
      </div>
    ),
  },
];
