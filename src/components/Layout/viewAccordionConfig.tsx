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
import ComponentsToolbar from "@components/ComponentsToolbar";
import ExternalSubmitButton from "@components/SubmitButton";
import MonacoEditor from "@components/MonacoEditor";
import AccordionTitle from "@components/AccordionTitle";
import BulkOperationsToolbar from "@components/BulkOperationsToolbar";
import ActionStepsWrapper from "@components/ActionSteps";
import View from "@components/View";

export const viewAccordionConfig: AccordionSection[] = [
  {
    key: "view",
    title: "view",
    icon: iconMap["view"]
      ? React.createElement(iconMap["view"], { size: 16 })
      : null,
    Component: ({ activeTask, selectedRecords, bulkActionSelect }) => (
      <div>view accordion config</div>
      // <View
      //   view_name="audio_recommendations"
      //   collection="recommendations"
      // ></View>
      // <div className="w-full">
      //   <div className="flex justify-center w-full">
      //     <div className="w-1/5"></div>
      //     <div className="w-3/5 pb-2 pt-2 flex gap-2">
      //       {selectedRecords["issues"]?.length > 0 && (
      //         <>
      //           <BulkOperationsToolbar
      //             include_components={[
      //               {
      //                 action: "view",
      //                 entity_type: "selected_records",
      //                 type: "action",
      //                 record: activeTask,
      //                 onClick: bulkActionSelect,
      //               },
      //               {
      //                 action: "bulk_update",
      //                 entity_type: "selected_records",
      //                 type: "action",
      //                 record: activeTask,
      //                 onClick: bulkActionSelect,
      //               },
      //               {
      //                 action: "close",
      //                 entity_type: "selected_records",
      //                 type: "action",
      //                 record: activeTask,
      //                 onClick: bulkActionSelect,
      //               },
      //               {
      //                 action: "assign",
      //                 entity_type: "selected_records",
      //                 type: "action",
      //                 record: activeTask,
      //                 onClick: bulkActionSelect,
      //               },
      //               {
      //                 action: "delete",
      //                 entity_type: "selected_records",
      //                 type: "action",
      //                 record: activeTask,
      //                 onClick: bulkActionSelect,
      //               },
      //               {
      //                 action: "custom_actions",
      //                 entity_type: "selected_records",
      //                 type: "action",
      //                 record: activeTask,
      //                 onClick: bulkActionSelect,
      //               },
      //             ]}
      //           ></BulkOperationsToolbar>
      //         </>
      //       )}
      //     </div>
      //     <div className="w-1/5"></div>
      //   </div>

      //   {activeTask && (
      //     <div className="w-full">
      //       <ActionStepsWrapper
      //         entity_type="action_steps"
      //         record={activeTask}
      //         aggregate_action_steps={true}
      //       />
      //     </div>
      //   )}
      // </div>
    ),
  },
];
