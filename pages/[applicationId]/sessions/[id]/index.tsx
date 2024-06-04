import ListView from "@components/ListView";
import MonacoEditor from "@components/MonacoEditor";
import SelectAction from "@components/SelectAction";
import { useFetchSessionById } from "@components/Utils";
import {
  IApplication,
  IDataset,
  IListItem,
  IView,
} from "@components/interfaces";
import { Accordion, Text } from "@mantine/core";
import {
  HttpError,
  IResourceComponentsProps,
  useCustom,
  useOne,
  useParsed,
  useShow,
} from "@refinedev/core";
import { Show } from "@refinedev/mantine";
import React, { useEffect } from "react";
import { useAppStore } from "src/store";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const { params } = useParsed();

  const {
    data: applicationData,
    isLoading: isLoadingApplication,
    isError: isErrorApplication,
  } = useOne<IApplication, HttpError>({
    resource: "applications",
    id: `${params?.applicationId}`,
  });

  // console.log("params.id", params?.id);
  // getSessionById
  const {
    data: session,
    isLoading: sessionIsLoading,
    error: sessionError,
  } = useFetchSessionById(params?.id);

  // const sessionDataset = useOne<IDataset, HttpError>({
  //   resource: "datasets",
  //   id: "datasets:⟨0d2b472d-0473-4770-b7f9-0a1c986b824f⟩",
  // });

  // console.log("sessionDataset", sessionDataset);
  // const defaultDatasetListItem = sessionDataset.data?.data.list.find(
  //   (item) => item.name == "default"
  // );
  // console.log("defaultSessionListItem", defaultSessionListItem);

  // const actionsList = defaultDatasetListItem?.actions;
  // console.log("actionsList", actionsList);

  // const { queryResult } = useShow();
  const {
    setActiveSession,
    activeSession,
    setActiveApplication,
    setActiveAction,
    setActiveRecord,
    setActiveViewItem,
    setActiveDataset,
    activeQueryGraph,
  } = useAppStore();
  // use effect to set active dataset
  // useEffect(() => {
  //   if (sessionDataset?.data) {
  //     setActiveDataset(sessionDataset?.data?.data);
  //   }
  // }, [sessionDataset?.data]);

  // const { data, isLoading } = queryResult;

  // const session = data?.data;
  // when session changes, set activeSession
  const { data, isLoading } = useCustom({
    url: `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}/catch`,
    queryOptions: {
      queryKey: ["query-graph-key"],
      enabled: true,
    },
    method: "post",
    config: {
      payload: {
        global_variables: {},
        include_execution_orders: [1],
        action_steps: [
          {
            id: "1",
            execution_order: 1,
            tool: "query",
            tool_arguments: {
              query: activeQueryGraph[0],
            },
          },
        ],
      },
    },
    successNotification: (data, values) => {
      // console.log("successNotification", data);
      // invalidate query

      // queryClient.invalidateQueries(["list_action_history_1"]);
      // queryClient.invalidateQueries([activeViewItem?.id]); // invalidate the active view query to retrigger refresh of values

      return {
        message: `successfully executed.`,
        description: "Success with no errors",
        type: "success",
      };
    },
    errorNotification: (data, values) => {
      // console.log("successNotification", data?.response.status);
      // console.log("errorNotification values", values);
      return {
        message: `${data?.response.status} : ${
          data?.response.statusText
        } : ${JSON.stringify(data?.response.data)}`,
        description: "Error",
        type: "error",
      };
    },
  });
  useEffect(() => {
    if (session?.data[0]) {
      setActiveSession(session?.data[0]);
      // also set activeAction, activeRecord, activeView to null when session changes
      setActiveAction(null);
      setActiveRecord(null);
      setActiveViewItem(null);
    }
  }, [session?.data[0]]);

  // when session changes, set activeSession
  useEffect(() => {
    if (applicationData?.data) {
      setActiveApplication(applicationData?.data);
    }
  }, [applicationData?.data]);
  // console.log("activeSession", activeSession);
  const setFieldValue = (field: string, value: any) => {
    console.log("field", field);
  };

  return (
    <>
      <Text>
        <b>name:</b>{" "}
        {activeSession?.name ||
          activeSession?.display_name ||
          activeSession?.title}
      </Text>
      {/* <MonacoEditor
        value={activeSession?.global_variables}
        language="json"
        setFieldValue={setFieldValue}
        height="100vh"
      /> */}
      <div>{JSON.stringify(activeQueryGraph)}</div>
    </>
  );
};
export default PageShow;
