import { AccordionSection } from "@components/interfaces";
import ActionInputWrapper from "@components/ActionInput";
// import { iconMap } from "@components/Utils";
import React from "react";
import MonacoEditor from "@components/MonacoEditor";

export const viewFooterAccordionConfig: AccordionSection[] = [
  {
    key: "view_footer",
    // title: <div>title for view</div>,
    // icon: iconMap["save"]
    //   ? React.createElement(iconMap["save"], { size: 16 })
    //   : null,
    Component: ({ view_record, globalQuery }) => (
      // <div>view query accordion </div>
      <div className="border-b border-gray-200">
        {/* {null} */}
        <MonacoEditor
          value={globalQuery}
          language="sql"
          height="50vh"
          // options={{
          //   minimap: { enabled: false },
          //   scrollBeyondLastLine: false,
          //   fontSize: 14,
          //   lineNumbers: "on",
          // }}
        />
      </div>
      // <ActionInputWrapper
      //   name={action}
      //   query_name="data_model"
      //   record={record}
      //   action={action}
      //   success_message_code="action_input_data_model_schema"
      // />
    ),
  },
];
