import AccordionComponent from "@components/AccordionComponent";
import DataDisplay from "@components/DataDisplay";
import ErrorComponent from "@components/ErrorComponent";
import MonacoEditor from "@components/MonacoEditor";
import PythonEnvironment from "@components/PythonEnvironment";
import { useReadRecordByState } from "@components/Utils";
import { useGetIdentity, useParsed } from "@refinedev/core";
// import { useDuckDB } from "pages/_app";
// import { useEffect, useState } from "react";
import { useAppStore, useTransientStore } from "src/store";
// import { viewQueryAccordionConfig } from "./viewQueryAccordionConfig";
// import { actionInputAccordionConfig } from "./actionInputAccordionConfig";
// import { ActionInputForm } from "@components/ActionInput";
// import { titleAccordionConfig } from "./titleAccordionConfig";
// import { Tooltip, Text } from "@mantine/core";
// import Reveal from "@components/Reveal";
// import { useViewportSize } from "@mantine/hooks";
// import Documentation from "@components/Documentation";
// import { IconInfoCircle } from "@tabler/icons-react";
// import { View } from "./View";
// import { viewFooterAccordionConfig } from "./viewFooterAccordionConfig";
import { IIdentity } from "@components/interfaces";
import LocalDBView from "./LocalDBView";

interface ViewWrapperProps {
  view_id_prop?: string;
  view_item?: any;
}

const ViewWrapper = ({ view_id_prop, view_item }: ViewWrapperProps) => {
  const { params } = useParsed();
  // const { width } = useViewportSize();
  const { data: identity } = useGetIdentity<IIdentity>();

  const {
    activeTask,
    activeView,
    activeSession,
    activeProfile,
    activeApplication,
    // action_input_form_fields,
    // activeEvent,
    // request_response,
    // activeMainCustomComponent,
  } = useAppStore();

  const action_input_form_values_key = `query_${params?.id || activeTask?.id}`;
  // const fields = action_input_form_fields[action_input_form_values_key];

  const view_id = view_item?.view_id;
  // const task_id = params?.task_id;
  // const session_id = params?.session_id;

  let fetch_view_by_id_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: view_id,
    record: {
      id: view_id,
    },
    read_record_mode: "remote",
  };

  const {
    data: viewData,
    isLoading: viewIsLoading,
    error: viewError,
  } = useReadRecordByState(fetch_view_by_id_state);

  let view_record = viewData?.data?.find(
    (item: any) =>
      item?.message?.code ===
      String(fetch_view_by_id_state?.success_message_code)
  )?.data[0];
  // const { forms } = useTransientStore();

  // const query_action_input_form_values = useAppStore(
  //   (state) => state.action_input_form_values[action_input_form_values_key]
  // );

  // const globalSearchQuery = useAppStore(
  //   (state) =>
  //     state.action_input_form_values[`${action_input_form_values_key}`]?.query
  // );

  // fetch
  let fetch_by_state = {
    id: view_item?.id,
    items: [view_item],
    action: {
      name: "fetch",
      id: "fetch",
    },
    input_values: {
      // ...value,
      // action_input_form_values:
      //   action_input_form_values[action_input_form_values_key] ||
      //   {},
    },
    application: {
      id: activeApplication?.id,
      name: activeApplication?.name,
    },
    session: {
      id: params?.session_id || activeSession?.id,
      name: params?.session_id || activeSession?.name,
    },
    task: {
      id: params?.id || activeTask?.id,
      name: params?.id || activeTask?.name,
    },
    automation: {
      // frequency: "every 20 seconds",
    },
    view: {
      id: view_id,
      name: view_id,
    },
    profile: {
      id: params?.profile_id || activeProfile?.id || identity?.email,
      name: params?.profile_id || activeProfile?.name || identity?.email,
    },
    parents: {
      task_id: params?.id || activeTask?.id,
      profile_id: params?.profile_id || activeProfile?.id || identity?.email,
      view_id: params?.view_id || activeView?.id,
      session_id: params?.session_id || activeSession?.id,
      application_id: activeApplication?.id,
    },
  };
  // const {
  //   data: fetchData,
  //   isLoading: fetchIsLoading,
  //   error: fetchError,
  // } = useFetchByState(fetch_by_state);

  if (viewIsLoading) return <div>Loading...</div>;

  if (viewError) {
    return <ErrorComponent error={viewError} component={"Error"} />;
  }

  // let item_name = view_record?.actions[0]?.name;

  // let dataItems = fetchData?.data?.find(
  //   (item: any) => item?.message?.code === "wyndham_transactions"
  // )?.data;

  return (
    <div className="flex flex-col">
      {/* <div>view wrapper</div> */}
      {/* <MonacoEditor
        value={{
          // fetch_view_by_id_state: fetch_view_by_id_state,
          // item_name: item_name,
          // fetchData: fetchData,
          // viewData: viewData,
          // activeTask: activeTask,
          view_record: view_record,
          // view_item: view_item,
          // fetchIsLoading: fetchIsLoading,
          // fetchData: fetchData,
          // fetchError: fetchError,
          // dataItems: dataItems,
        }}
        height="25vh"
        language="json"
      ></MonacoEditor> */}

      {/* {view_record && dataItems && (
        <DataDisplay
          data_items={dataItems}
          entity_type="action_step_results"
          view_mode={activeMainCustomComponent?.name || "datagrid"}
          view_record={view_record}
          data_fields={view_record?.fields}
        />
      )} */}
      {view_record && (
        <LocalDBView view_record={view_record} view_item={view_item} />
      )}
    </div>
  );
};
export default ViewWrapper;
