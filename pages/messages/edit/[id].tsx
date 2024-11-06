import { Title, Text } from "@mantine/core";
import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "src/store";
import { useParsed, useNavigation, useGetIdentity } from "@refinedev/core";
import { useReadRecordByState } from "@components/Utils";
import ErrorComponent from "@components/ErrorComponent";
import Breadcrumbs from "@components/Breadcrumbs";
import ActionInputWrapper from "@components/ActionInput";
import { IIdentity } from "@components/interfaces";

export const ShowPage: React.FC = () => {
  const { data: identity } = useGetIdentity();

  // // Display loading or error state
  // if (loading) return <div>Loading...</div>;

  // if (error) {
  //   return (
  //     <ErrorComponent error={error} component={"Error loading params data"} />
  //   );
  // }

  // console.log("PROFILE ID:", activeProfile?.id);
  // // console.log("VIEW ID:", activeView?.id);

  // Render the page content
  return (
    <>
      {identity && (
        <ActionInputWrapper
          name="settings"
          query_name="data_model"
          record={identity}
          action={"edit"}
          read_record_mode="local"
          success_message_code="action_input_data_model_schema"
        />
      )}
      {/* <div>{JSON.stringify(identity)}</div> */}
      {/* {!activeView && (<Title order={3}>Get Important Things Done.</Title>)} */}
      {/* <Breadcrumbs /> */}
      {/* <Text>Task Show Page</Text>
      <Title order={2}>{activeTask?.name || "No Task Name"}</Title> */}
    </>
  );
};

export default ShowPage;
