// sampleAccordionConfig.ts
// This is an example configuration for accordion sections.
import ActivityWrapper from "@components/Activity";
import { AccordionSection } from "@components/interfaces";
import { iconMap } from "@components/Utils";
import React from "react";

export const activityActionAccordionConfig: AccordionSection[] = [
  {
    // key: "search",
    // title: "Search",
    // icon: iconMap["search"]
    //   ? React.createElement(iconMap["search"], { size: 16 })
    //   : null,
    Component: ({ record, action }) => (
      // <div>activity</div>
      <ActivityWrapper
      // name={action}
      // query_name="data_model"
      // record={record}
      // action={action}
      // success_message_code="action_input_data_model_schema"
      />
    ),
  },
];
