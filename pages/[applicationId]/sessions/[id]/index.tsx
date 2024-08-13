import {
  mergeEdgeWithEntityValues,
  useDataColumns,
  useFetchSessionById,
  useFetchViewById,
  useFetchViewByName,
} from "@components/Utils";
// import {
//   FieldConfiguration,
//   IApplication,
//   IDataset,
//   IListItem,
//   IView,
// } from "@components/interfaces";
import {
  Accordion,
  Button,
  LoadingOverlay,
  Modal,
  Text,
  TextInput,
} from "@mantine/core";
import {
  HttpError,
  IResourceComponentsProps,
  useCustom,
  useOne,
  useParsed,
  useShow,
} from "@refinedev/core";
// import { Show } from "@refinedev/mantine";
import React, { useEffect, useState } from "react";
import { useAppStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";
import ActionStepView from "@components/ActionStepView";
import SelectAction from "@components/SelectAction";
// import FloatingWindow from "@components/FloatingWindow";
// import RetriveView from "@components/RetrieveView";
// import config from "src/config";

export const PageShow: React.FC<IResourceComponentsProps> = () => {
  const { params } = useParsed();
  // const queryClient = useQueryClient();

  // get application from params
  // const {
  //   data: applicationData,
  //   isLoading: isLoadingApplication,
  //   isError: isErrorApplication,
  // } = useOne<IApplication, HttpError>({
  //   resource: "applications",
  //   id: `${params?.applicationId}`,
  // });

  // get session from params
  const {
    data: sessionData,
    isLoading: sessionIsLoading,
    error: sessionError,
  } = useFetchSessionById(params?.id);

  // // get default view by id
  // const {
  //   data: defaultView,
  //   isLoading: defaultViewIsLoading,
  //   error: defaultViewError,
  // } = useFetchViewById("views:⟨018fff37-21c0-707f-b7f0-928c4c9412b5⟩");

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
    // setActiveSession,
    // activeSession,
    // setActiveApplication,
    // setActiveAction,
    // setActiveRecord,
    // setActiveViewItem,
    // setActiveDataset,
    // activeQueryGraph,
  } = useAppStore();
  // use effect to set active dataset
  // useEffect(() => {
  //   if (sessionDataset?.data) {
  //     setActiveDataset(sessionDataset?.data?.data);
  //   }
  // }, [sessionDataset?.data]);

  // const { data, isLoading } = queryResult;

  // Invalidate query key when activeQueryGraph changes
  // useEffect(() => {
  //   if (activeQueryGraph) {
  //     queryClient.invalidateQueries(["execute-query-graph-key"]);
  //   }
  // }, [activeQueryGraph]);

  // const session = data?.data;
  // when session changes, set activeSession
  // const { data, isLoading, isFetching } = useCustom({
  //   url: `${config.API_URL}/catch`,
  //   queryOptions: {
  //     queryKey: ["execute-query-graph-key", activeQueryGraph],
  //     enabled: true,
  //   },
  //   method: "post",
  //   config: {
  //     payload: {
  //       global_variables: {},
  //       include_execution_orders: [1],
  //       action_steps: [
  //         {
  //           id: "1",
  //           execution_order: 1,
  //           tool: "execute_query_graph",
  //           tool_arguments: {
  //             query_graph: activeQueryGraph?.[0] || {},
  //           },
  //         },
  //       ],
  //     },
  //   },
  //   successNotification: (data, values) => {
  //     // console.log("successNotification", data);
  //     // invalidate query

  //     // queryClient.invalidateQueries(["list_action_history_1"]);
  //     // queryClient.invalidateQueries([activeViewItem?.id]); // invalidate the active view query to retrigger refresh of values

  //     return {
  //       message: `successfully executed.`,
  //       description: "Success with no errors",
  //       type: "success",
  //     };
  //   },
  //   errorNotification: (data, values) => {
  //     // console.log("successNotification", data?.response.status);
  //     // console.log("errorNotification values", values);
  //     return {
  //       message: `${data?.response.status} : ${
  //         data?.response.statusText
  //       } : ${JSON.stringify(data?.response.data)}`,
  //       description: "Error",
  //       type: "error",
  //     };
  //   },
  // });
  // let sessionRecord = session?.data[0]?.find(
  //   (item: any) => item?.message === "Query successfully executed"
  // ).results[0]["result"][0];

  // useEffect(() => {
  //   if (sessionRecord) {
  //     setActiveSession(sessionRecord);
  //     // also set activeAction, activeRecord, activeView to null when session changes
  //     // setActiveAction(null);
  //     setActiveRecord(null);
  //     setActiveViewItem(null);
  //   }
  // }, [sessionRecord]);

  // when session changes, set activeSession
  // useEffect(() => {
  //   if (applicationData?.data) {
  //     setActiveApplication(applicationData?.data);
  //   }
  // }, [applicationData?.data]);
  // console.log("activeSession", activeSession);
  // const setFieldValue = (field: string, value: any) => {
  //   console.log("field", field);
  // };

  return (
    <>
      {/* <div>{JSON.stringify(data?.data[0]?.main_query["select"]["data"])}</div> */}
      {/* {JSON.stringify(defaultView)} */}
      {/* <FloatingWindow></FloatingWindow> */}
      {/* <Text>
        <b>name:</b>{" "}
        {activeSession?.name ||
          activeSession?.display_name ||
          activeSession?.title}
      </Text> */}
      {/* {JSON.stringify(
        sessionData?.data?.find(
          (item: any) => item?.message?.code === "query_success_results"
        ).data[0]
      )} */}
      <Accordion defaultValue="main_query">
        {sessionData?.data?.find(
          (item: any) => item?.message?.code === "query_success_results"
        ).data[0]?.action_steps &&
          sessionData?.data
            ?.find(
              (item: any) => item?.message?.code === "query_success_results"
            )
            .data[0]?.action_steps.sort(
              (a: any, b: any) => a.execution_order - b.execution_order
            )
            .map((item: any) => {
              return <ActionStepView action_step={item} />;
            })}
      </Accordion>

      {/* <SelectAction></SelectAction> */}
      {/* only render for unique items, i.e no duplicates so i dont make multiple requests */}
      {/* <Accordion defaultValue="main_query">
        {data?.data[0]?.ctes["result_view_CTE"]?.["data"] &&
          data?.data[0]?.ctes["result_view_CTE"]?.["data"].map((item: any) => {
            return (
              <RetriveView view_definition={item} data={data}></RetriveView>
            );
          })}
      </Accordion> */}
    </>
  );
};
export default PageShow;
