// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.

import { AccordionSection } from "@components/interfaces";
import { iconMap } from "@components/Utils";
import React from "react";
import PinnedActionStepResults from "@components/PinnedActionStepResults";

export const issuesViewAccordionConfig: AccordionSection[] = [
  {
    key: "issues",
    title: "Issues",
    icon: iconMap["issues"]
      ? React.createElement(iconMap["issues"], { size: 16 })
      : null,
    Component: ({ activeTask }) => (
      <div>
        {activeTask ? (
          <PinnedActionStepResults success_message_code="issues" />
        ) : (
          <div className="flex items-center justify-center p-4">
            <p className="text-sm text-gray-600 text-center">
              "issues" step will appear here when pinned.
            </p>
          </div>
        )}
      </div>
    ),
  },
];
