import { IIdentity } from "@components/interfaces";
import { useGetIdentity, useParsed } from "@refinedev/core";
import { useEffect, useState } from "react";
import { useAppStore } from "src/store";

interface ExecutionDataFetcherProps {
  view: any;
  view_item: any;
  view_id: string;
  task_id: string;
  session_id: string;
  onStepFetched: () => void;
}

export function ExecutionDataFetcher({
  // step,
  view,
  view_item,
  onStepFetched,
  view_id,
  task_id,
  session_id,
}: ExecutionDataFetcherProps) {
  const {
    activeApplication,
    activeSession,
    activeProfile,
    activeView,
    activeTask,
  } = useAppStore();
  const { params } = useParsed();
  const { data: identity } = useGetIdentity<IIdentity>();
  let data = [];
  let isLocalDBSuccess = false;
  let isLoading = false;
  // const { data, isLocalDBSuccess, isLoading } = useFetchData({
  //   success_message_code: view?.actions?.[0]?.name || "records",
  //   view_record: view,
  //   // success_message_code:
  //   //   view?.success_message_code || activeTask?.success_message_code,
  //   id: view_item?.id,
  //   items: [view_item],
  //   action: {
  //     name: "fetch",
  //     id: "fetch",
  //   },
  //   input_values: {
  //     // ...value,
  //     // action_input_form_values:
  //     //   action_input_form_values[action_input_form_values_key] ||
  //     //   {},
  //   },
  //   application: {
  //     id: activeApplication?.id,
  //     name: activeApplication?.name,
  //   },
  //   session: {
  //     id: params?.session_id || activeSession?.id,
  //     name: params?.session_id || activeSession?.name,
  //   },
  //   task: {
  //     id: params?.id || activeTask?.id,
  //     name: params?.id || activeTask?.name,
  //   },
  //   automation: {
  //     // frequency: "every 20 seconds",
  //   },
  //   view: {
  //     id: view_id,
  //     name: view_id,
  //   },
  //   profile: {
  //     id: params?.profile_id || activeProfile?.id || identity?.email,
  //     name: params?.profile_id || activeProfile?.name || identity?.email,
  //   },
  //   parents: {
  //     task_id: params?.id || activeTask?.id,
  //     profile_id: params?.profile_id || activeProfile?.id || identity?.email,
  //     view_id: params?.view_id || activeView?.id,
  //     session_id: params?.session_id || activeSession?.id,
  //     application_id: activeApplication?.id,
  //   },
  // });

  useEffect(() => {
    if (!isLoading && isLocalDBSuccess) {
      onStepFetched(); // Notify parent that this step is fetched
    }
  }, [isLoading, isLocalDBSuccess]);

  return null; // This component doesn't render any UI
}

export default ExecutionDataFetcher;
