// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.

import { AccordionSection } from "@components/interfaces";
import { iconMap } from "@components/Utils";
import React from "react";
import PinnedActionStepResults from "@components/PinnedActionStepResults";

export const summaryViewAccordionConfig: AccordionSection[] = [
  {
    key: "summary",
    title: "Summary",
    icon: iconMap["summary"]
      ? React.createElement(iconMap["summary"], { size: 16 })
      : null,
    Component: ({ activeTask, selectedRecords }) => (
      <div>
        {activeTask ? (
          <PinnedActionStepResults success_message_code="summary" />
        ) : (
          <div className="flex items-center justify-center p-4">
            <p className="text-sm text-gray-600 text-center">
              "summary" step will appear here when pinned.
            </p>
          </div>
        )}

        {/* {activeTask &&
        selectedRecords[`plan_${activeTask?.id}`]?.some(
          (record: { name: string }) => record.name === "summary"
        ) ? (
          <PinnedActionStepResults success_message_code="summary" />
        ) : (
          <div className="flex items-center justify-center p-4">
            <p className="text-sm text-gray-600 text-center">
              "summary" step will appear here when pinned.
            </p>
          </div>
        )} */}
      </div>
    ),
  },
];
