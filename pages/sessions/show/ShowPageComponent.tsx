// ShowPage.tsx
import { useEffect } from "react";
import { useAppStore } from "src/store";
import {
  getLabel,
  getTooltipLabel,
  useIsMobile,
  useReadRecordByState,
} from "@components/Utils";
import { useParsed } from "@refinedev/core";
import ResponseViewWrapper from "@components/View/ResponseView";
import MonacoEditor from "@components/MonacoEditor";
import { useExecuteFunctionWithArgs } from "@components/hooks/useExecuteFunctionWithArgs";
import { useToggleView } from "@components/hooks/useToggleView";
import Reveal from "@components/Reveal";
import { Tooltip, Text } from "@mantine/core";

export const ShowPageComponent: React.FC = () => {
  const { activeSession, setActiveSession, views, setViews } = useAppStore();
  const { params } = useParsed();
  const { toggleView } = useToggleView();
  const isMobile = useIsMobile(); // Custom hook to check if the screen is mobile
  let session_id = params?.id;
  let view_items = params?.view_items?.split(",") || [];

  // Session fetch logic
  let read_session_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: session_id,
    id: session_id,
    record: { id: session_id },
    read_record_mode: "remote",
  };

  const {
    data: sessionData,
    isLoading: sessionIsLoading,
    error: sessionError,
  } = useReadRecordByState(read_session_state);

  // View items fetch logic
  const missingViewItems = view_items.filter((id: any) => !views[id]);

  // const {
  //   data: viewItemsData,
  //   isLoading: viewItemsLoading,
  //   error: viewItemsError,
  // } = useReadRecordByState({
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: missingViewItems.join(","),
  //   id: missingViewItems.join(","),
  //   record: { ids: missingViewItems },
  //   read_record_mode: "remote",
  //   skip: missingViewItems.length === 0,
  // });

  let view_items_query_state = {
    // id:
    //   activeView?.id ||
    //   activeTask?.id ||
    //   activeSession?.id ||
    //   activeProfile?.id,
    func_name: "fetch_system_view_items",
    name: "fetch_system_view_items",
    view_item_ids: missingViewItems,
    success_message_code: "fetch_system_view_items",
  };
  const {
    data: viewItemsData,
    isLoading: viewItemsIsLoading,
    error: viewItemsError,
  } = useExecuteFunctionWithArgs(view_items_query_state);

  let session_data = sessionData
    ? sessionData?.data?.find(
        (item: any) => item?.message?.code === read_session_state?.id
      )?.data[0]
    : null;

  // Update session
  useEffect(() => {
    if (session_data && activeSession?.id !== session_data?.id) {
      setActiveSession(session_data);
    }
  }, [session_data, activeSession?.id, setActiveSession]);

  // // Update view items
  // useEffect(() => {
  //   if (viewItemsData?.data) {
  //     // console.log(viewItemsData?.data);
  //     const newViews = viewItemsData.data.reduce((acc: any, item: any) => {
  //       if (item?.data?.[0]) {
  //         acc[item.data[0].id] = item.data[0];
  //       }
  //       return acc;
  //     }, {});
  //     // console.log(newViews);
  //     // setViews({ ...views, ...newViews });
  //     toggleView(String(record?.id), record);
  //   }
  // }, [viewItemsData, setViews]);
  useEffect(() => {
    if (viewItemsData?.data) {
      // Process each item in the viewItemsData
      viewItemsData.data.forEach((item: any) => {
        if (item?.data?.[0]) {
          const viewRecord = item.data[0];
          // Use computed property name syntax correctly
          setViews(String(viewRecord?.id), viewRecord);
        }
      });
    }
  }, [viewItemsData, setViews]);

  // const isLoading = sessionIsLoading || viewItemsLoading;
  // const error = sessionError || viewItemsError;

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  // if (error) {
  //   return <div>Error: {error.message}</div>;
  // }

  return (
    <>
      {/* <MonacoEditor
        value={{
          missingViewItems: missingViewItems,
          viewItemsData: viewItemsData,
          session_id: session_id,
          session_data: session_data,
          sessionData: sessionData,
          activeSession: activeSession,
        }}
      ></MonacoEditor> */}
      {isMobile && activeSession && (
        <div className="w-full overflow-hidden ">
          <Reveal
            trigger="click"
            target={
              <Tooltip
                multiline
                withArrow
                transitionProps={{ duration: 200 }}
                label={getTooltipLabel(activeSession)}
              >
                <div className="flex max-w-full overflow-hidden justify-center">
                  <Text size="sm" className="text-blue-500 truncate block px-3">
                    {getLabel(activeSession)}
                  </Text>
                </div>
              </Tooltip>
            }
          >
            <MonacoEditor value={activeSession} language="json" height="50vh" />
          </Reveal>
        </div>
      )}
      {isMobile ? null : <ResponseViewWrapper />}
    </>
  );
};

export default ShowPageComponent;
