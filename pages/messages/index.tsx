import ActionInputWrapper from "@components/ActionInput";
import ActivityWrapper from "@components/Activity";
import ListItemsWrapper from "@components/ListItems";
import React from "react";
export const PageList: React.FC = () => {
  return (
    // <div>
    //   {/* list messages page
    //   <ListItemsWrapper entity_type="messages"></ListItemsWrapper> */}
    //   <ActivityWrapper
    //   // name={action}
    //   // query_name="data_model"
    //   // record={record}
    //   // action={action}
    //   // success_message_code="action_input_data_model_schema"
    //   />
    //   <ActionInputWrapper
    //     name={"query"}
    //     query_name="data_model"
    //     record={{}}
    //     action={"query"}
    //     success_message_code="action_input_data_model_schema"
    //   />
    // </div>
    <div className="h-[85vh] flex flex-col">
      {" "}
      {/* Using 85% of viewport height */}
      {/* Top component */}
      <div className="flex-none">
        <ActivityWrapper />
      </div>
      {/* Bottom component */}
      <div className="flex-none mt-auto">
        <ActionInputWrapper
          name={"query"}
          query_name="data_model"
          record={{}}
          action={"query"}
          success_message_code="action_input_data_model_schema"
        />
      </div>
    </div>
  );
};
export default PageList;
