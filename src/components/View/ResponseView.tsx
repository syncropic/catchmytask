import AccordionComponent from "@components/AccordionComponent";
import DataDisplay from "@components/DataDisplay";
import ErrorComponent from "@components/ErrorComponent";
import MonacoEditor from "@components/MonacoEditor";
import PythonEnvironment from "@components/PythonEnvironment";
import {
  buildSQLQuery,
  enrichFilters,
  extractKeys,
  getLabel,
  getTooltipLabel,
  processDataItems,
  useIsMobile,
  useQueryByState,
  useRunTask,
} from "@components/Utils";
import { useGetIdentity, useGo, useParsed } from "@refinedev/core";
import { useAppStore, useTransientStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";
import DataGridView from "@components/DataGridView";
import {
  Accordion,
  Tooltip,
  Text,
  LoadingOverlay,
  Box,
  Loader,
  ActionIcon,
} from "@mantine/core";
import Reveal from "@components/Reveal";
import { IconInfoCircle, IconMaximize, IconSquareX } from "@tabler/icons-react";
import ExternalSubmitButton from "@components/SubmitButton";
import { useViewportSize } from "@mantine/hooks";
import Documentation from "@components/Documentation";
import { jsonify } from "surrealdb";
import ViewDocumentation from "@components/ViewDocumentation";
import { IIdentity } from "@components/interfaces";
import EmbedComponent from "@components/EmbedComponent";
import ViewItemForm from "@components/ViewItemForm";
import { useLiveQuery } from "@components/Utils/useLiveQuery";
import { ActionStatusInfo } from "@components/MessageLabel";
import { useExecuteFunctionWithArgs } from "@components/hooks/useExecuteFunctionWithArgs";
import InteractiveGraph from "@components/InteractiveGraph";

interface ResponseViewWrapperProps {}

const ResponseViewWrapper = ({}: ResponseViewWrapperProps) => {
  const { views } = useAppStore();
  const { params } = useParsed();
  const { width } = useViewportSize();
  const { showRequestResponseView } = useAppStore();
  const queryClient = useQueryClient();
  // const viewData = queryClient.getQueryData([view_query_key]);
  const responseData = queryClient.getQueryData(["main_form_request"]) as {
    data: any;
    response: any;
  };

  let view_items = params?.view_items?.split(",");

  return (
    <div className="flex flex-col">
      {!showRequestResponseView && !view_items && (
        <div className="flex justify-center items-center h-[65vh]">Views</div>
      )}
      {showRequestResponseView && (
        <Accordion multiple defaultValue={["showRequestResponseView"]}>
          <Accordion.Item
            value={"showRequestResponseView"}
            key={"showRequestResponseView"}
          >
            <Accordion.Control>request response view</Accordion.Control>
            <Accordion.Panel>
              <MonacoEditor
                value={{
                  responseData: responseData,
                }}
                height="75vh"
                language="json"
              ></MonacoEditor>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
      {/* <div>{JSON.stringify(view_items)}</div> */}
      {/* <div>ResponseViewWrapper - out</div> */}

      {view_items &&
        view_items?.map((view_item: any) => {
          return (
            <ViewItemWrapper
              key={view_item}
              view_item_id={view_item}
            ></ViewItemWrapper>
            // <div>ResponseViewWrapper</div>
          );
        })}
    </div>
  );
};
export default ResponseViewWrapper;

const ViewItemWrapper = ({ view_item_id }: { view_item_id: string }) => {
  const { width } = useViewportSize();
  const { views, activeProfile, activeApplication, activeSession, activeView } =
    useAppStore();
  const { params } = useParsed();
  const { data: identity } = useGetIdentity<IIdentity>();
  let view_item_record = views[view_item_id];

  if (
    ["actions"]?.includes(view_item_record?.entity_type) ||
    ["execute_task_id"]?.includes(view_item_record?.message_type)
  ) {
    return (
      <>
        <ViewItemRunTaskWrapper
          key={view_item_id}
          view_item_id={view_item_id}
        ></ViewItemRunTaskWrapper>
      </>
    );
  } else if (["content_embed_url"]?.includes(view_item_record?.message_type)) {
    return (
      <>
        <ViewItemContentEmbed
          // dataItems={view_item_record}
          view_item_id={view_item_id}
          include_components={["toolbar"]}
          view_item_record={view_item_record}
          query_state={{}}
          view_query_state={{}}
        />
      </>
    );
  } else if (
    ["content_stream_query"]?.includes(view_item_record?.message_type)
  ) {
    return (
      <>
        {/* <div>ViewItemContentStreamQuery</div> */}
        <ViewItemContentStreamQuery
          // dataItems={view_item_record}
          view_item_id={view_item_id}
          include_components={["toolbar"]}
          view_item_record={view_item_record}
          query_state={{}}
        />
      </>
    );
  } else {
    return (
      <ViewItemViewWrapper
        key={view_item_id}
        view_item_id={view_item_id}
      ></ViewItemViewWrapper>
    );
  }
};

const ViewItemRunTaskWrapper = ({ view_item_id }: { view_item_id: string }) => {
  const { width } = useViewportSize();
  const {
    views,
    activeProfile,
    activeApplication,
    activeSession,
    activeView,
    setViews,
    displayJSONView,
  } = useAppStore();
  const { params } = useParsed();
  const { data: identity } = useGetIdentity<IIdentity>();
  let view_item_record = views[view_item_id];
  const baseData = {
    application: {
      id: activeApplication?.id,
      name: activeApplication?.name,
    },
    session: {
      id: params?.session_id || activeSession?.id,
      name: activeSession?.name,
    },
    view: {
      id: params?.view_id || activeView?.id,
      name: params?.view_id || activeView?.name,
    },
    identity: identity,
    profile: {
      id: params?.profile_id || activeProfile?.id || identity?.email,
      name: params?.profile_id || activeProfile?.name || identity?.email,
    },
    parents: {
      task_id: view_item_record?.task_id,
      profile_id: params?.profile_id || activeProfile?.id || identity?.email,
      view_id: params?.view_id || activeView?.id,
      session_id: params?.id || activeSession?.id,
      application_id: params?.application_id || activeApplication?.id,
    },
  };

  let run_task_state = {
    ...baseData,
    task: {
      id: view_item_record?.task_id,
      name: view_item_record?.task_id,
    },
  };
  const {
    data: runTaskData,
    isLoading: runTaskDataIsLoading,
    error: runTaskDataError,
  } = useRunTask(run_task_state);

  let view_query_state = {
    // id:
    //   activeView?.id ||
    //   activeTask?.id ||
    //   activeSession?.id ||
    //   activeProfile?.id,
    func_name: "fetch_system_views",
    name: "fetch_system_views",
    // task_id: activeTask?.id,
    // session_id: activeSession?.id,
    // view_id: activeView?.id,
    // profile_id: activeProfile?.id,
    application_id: activeApplication?.id,
    // user_id: String(user_session?.userProfile?.user?.id),
    // author_id: identity?.email || "guest",
    view_name: view_item_record?.variables?.summary_message_view,
    success_message_code: "fetch_system_views",
  };
  const {
    data: viewData,
    isLoading: viewIsLoading,
    error: viewError,
  } = useExecuteFunctionWithArgs(view_query_state);

  let view_records = viewData?.data?.find
    ? viewData?.data?.find(
        (item: any) =>
          item?.message?.code === view_query_state?.success_message_code
      )?.data || []
    : null;
  let view_record = view_records ? view_records[0] : null;

  let actionItem = runTaskData?.data?.find
    ? runTaskData?.data?.find(
        (item: any) =>
          item?.message?.code === view_item_record?.summary_message_code
      )
    : {};

  let dataItems = processDataItems(actionItem?.data);
  // either read view from the response or retrieve view from external

  // let view_record = actionItem?.view;
  let include_components = ["toolbar"];

  const go = useGo();
  let view_ids = Object.keys(views);

  const toggleView = (id: string, record: any) => {
    // Access the current views from your zustand store
    const currentViews = views;

    // Check if the item exists in views
    const existingView = currentViews[id];

    const toggleItemInList = (list: any, itemId: any) => {
      // Check if item exists in list
      const exists = list.includes(itemId);

      if (exists) {
        // If exists, filter it out
        return list.filter((id: string) => id !== itemId);
      } else {
        // If doesn't exist, add it to the list (spreading the existing list)
        return [...list, itemId];
      }
    };

    if (existingView) {
      // Remove the view if it exists
      // const { [id]: removedView, ...remainingViews } = currentViews;
      setViews(id, null);
      let new_view_ids = toggleItemInList(view_ids, id);
      const queryParams: {
        profile_id: string;
        [key: string]: string;
      } = {
        profile_id: String(activeProfile?.id),
      };

      if (new_view_ids?.length > 0) {
        queryParams.view_items = String(new_view_ids);
      }
      go({
        // to: {
        //   resource: "sessions",
        //   action: "show",
        //   id: record?.id,
        // },
        query: queryParams,
        type: "push",
      });
    } else {
      // Add the view if it doesn't exist
      setViews(id, record);
      let new_view_ids = [...view_ids, id];
      const queryParams: {
        profile_id: string;
        [key: string]: string;
      } = {
        profile_id: String(activeProfile?.id),
      };

      if (new_view_ids?.length > 0) {
        queryParams.view_items = String(new_view_ids);
      }
      go({
        // to: {
        //   resource: "sessions",
        //   action: "show",
        //   id: record?.id,
        // },
        query: queryParams,
        type: "push",
      });
    }
  };
  // if (runTaskDataIsLoading || viewIsLoading) {
  //   return <div>loading...</div>;
  // }

  const pathsToDeserialize = ["TicktingInfo"];

  if (runTaskDataError || viewError) {
    return (
      <>
        <MonacoEditor
          value={{
            runTaskDataError: runTaskDataError,
            viewError: viewError,
          }}
          language="json"
          height="25vh"
        ></MonacoEditor>
      </>
    );
  }

  return (
    <div>
      {/* ViewItemRunTaskWrapper */}
      {displayJSONView && (
        <div>
          <div>{`${view_item_record?.name} | ${view_item_record?.id}`}</div>
          <MonacoEditor
            value={{
              error: runTaskDataError,
              runTaskData: runTaskData,
              // runTaskDataIsLoading: runTaskDataIsLoading,
              dataItems: dataItems,
              // actionItem: actionItem,
              view_item_record: view_item_record,
              // viewData: viewData,
              view_record: view_record,
            }}
            language="json"
            height="65vh"
          ></MonacoEditor>
        </div>
      )}
      {runTaskDataIsLoading && (
        <Accordion multiple>
          <Accordion.Item value={view_item_id} key={view_item_id}>
            <Accordion.Control>
              <div className="flex items-center gap-3">
                <Loader size={18} />
                <div>|</div>
                <div className="text-sm font-semibold px-3 break-words max-w-xs sm:max-w-md">
                  {view_item_record?.name}
                </div>
                <Tooltip label="close" key="close">
                  <ActionIcon
                    variant="default"
                    size="sm"
                    aria-label="close"
                    onClick={() =>
                      toggleView(String(view_item_record?.id), view_item_record)
                    }
                  >
                    <IconSquareX />
                  </ActionIcon>
                </Tooltip>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="flex justify-center items-center">
                loading content ...
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
      {!runTaskDataIsLoading && !dataItems && !view_record && (
        <Accordion multiple defaultValue={[view_item_id]}>
          <Accordion.Item value={view_item_id} key={view_item_id}>
            <Accordion.Control>{view_item_record?.name}</Accordion.Control>
            <Accordion.Panel>
              <MonacoEditor
                value={{
                  error: runTaskDataError,
                  runTaskData: runTaskData,
                  runTaskDataIsLoading: runTaskDataIsLoading,
                }}
                language="json"
              ></MonacoEditor>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}
      {!runTaskDataIsLoading && dataItems && view_record && (
        <>
          <ViewItem
            dataItems={dataItems}
            view_record={view_record}
            view_query_state={view_query_state}
            include_components={include_components}
            view_item_id={view_item_id}
            view_item_record={view_item_record}
            query_state={run_task_state}
          />
        </>
      )}
      {!runTaskDataIsLoading && dataItems && !view_record && (
        <>
          {/* <div>{JSON.stringify(dataItems)}</div> */}
          <ViewItem
            dataItems={deserializeByPaths(dataItems, [
              {
                path: "TicktingInfo",
                select: ["BookingRequest", "CustomerID"], // Keep both BookingRequest and CustomerID
              },
            ])}
            view_record={view_record}
            view_query_state={view_query_state}
            include_components={include_components}
            view_item_id={view_item_id}
            view_item_record={view_item_record}
            query_state={run_task_state}
          />
        </>
      )}
    </div>
  );
};

const ViewItemViewWrapper = ({ view_item_id }: { view_item_id: string }) => {
  const { width } = useViewportSize();
  const {
    views,
    activeProfile,
    activeApplication,
    activeSession,
    activeView,
    setViews,
  } = useAppStore();
  const { params } = useParsed();
  const { data: identity } = useGetIdentity<IIdentity>();
  let view_item_record = views[view_item_id];

  const query_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: view_item_record?.id,
    query: `SELECT * FROM ${view_item_record?.entity_type} WHERE id = ${view_item_record?.id}`,
    record: {
      id: view_item_record?.id,
    },
    read_record_mode: "remote",
  };

  const {
    data: runTaskData,
    isLoading: runTaskDataIsLoading,
    error: runTaskDataError,
  } = useQueryByState(query_state);

  // return (
  //   <>
  //     <MonacoEditor
  //       value={{
  //         viewData: viewData,
  //       }}
  //       language="json"
  //       height="25vh"
  //     ></MonacoEditor>
  //   </>
  // );

  // let actionItem = runTaskData?.data?.find
  //   ? runTaskData?.data?.find(
  //       (item: any) => item?.action_step?.id === view_item_id
  //     )
  //   : {};

  // return <div>{JSON.stringify(runTaskData?.data)}</div>;

  let dataItems = runTaskData?.data;
  // either read view from the response or retrieve view from external

  let view_record = {};
  let include_components = ["toolbar"];

  const go = useGo();
  let view_ids = Object.keys(views);

  const toggleView = (id: string, record: any) => {
    // Access the current views from your zustand store
    const currentViews = views;

    // Check if the item exists in views
    const existingView = currentViews[id];

    const toggleItemInList = (list: any, itemId: any) => {
      // Check if item exists in list
      const exists = list.includes(itemId);

      if (exists) {
        // If exists, filter it out
        return list.filter((id: string) => id !== itemId);
      } else {
        // If doesn't exist, add it to the list (spreading the existing list)
        return [...list, itemId];
      }
    };

    if (existingView) {
      // Remove the view if it exists
      // const { [id]: removedView, ...remainingViews } = currentViews;
      setViews(id, null);
      let new_view_ids = toggleItemInList(view_ids, id);
      const queryParams: {
        profile_id: string;
        [key: string]: string;
      } = {
        profile_id: String(activeProfile?.id),
      };

      if (new_view_ids?.length > 0) {
        queryParams.view_items = String(new_view_ids);
      }
      go({
        // to: {
        //   resource: "sessions",
        //   action: "show",
        //   id: record?.id,
        // },
        query: queryParams,
        type: "push",
      });
    } else {
      // Add the view if it doesn't exist
      setViews(id, record);
      let new_view_ids = [...view_ids, id];
      const queryParams: {
        profile_id: string;
        [key: string]: string;
      } = {
        profile_id: String(activeProfile?.id),
      };

      if (new_view_ids?.length > 0) {
        queryParams.view_items = String(new_view_ids);
      }
      go({
        // to: {
        //   resource: "sessions",
        //   action: "show",
        //   id: record?.id,
        // },
        query: queryParams,
        type: "push",
      });
    }
  };

  if (runTaskDataError) {
    return (
      <>
        <MonacoEditor
          value={{
            runTaskDataError: runTaskDataError,
          }}
          language="json"
          height="25vh"
        ></MonacoEditor>
      </>
    );
  }

  return (
    <div>
      {/* <MonacoEditor
        value={{
          dataItems: dataItems,
          // error: runTaskDataError,
          // runTaskData: runTaskData,
          // runTaskDataIsLoading: runTaskDataIsLoading,
        }}
        language="json"
        height="25vh"
      ></MonacoEditor> */}
      {runTaskDataIsLoading && (
        <Accordion multiple>
          <Accordion.Item value={view_item_id} key={view_item_id}>
            <Accordion.Control>
              <div className="flex items-center gap-4">
                <Loader size={18} />
                <div>|</div>
                <div className="text-sm font-semibold px-3 break-words max-w-xs sm:max-w-md">
                  {view_item_record?.name}
                </div>
                <Tooltip label="close" key="close">
                  <ActionIcon
                    variant="default"
                    size="sm"
                    aria-label="close"
                    onClick={() =>
                      toggleView(String(view_item_record?.id), view_item_record)
                    }
                  >
                    <IconSquareX />
                  </ActionIcon>
                </Tooltip>
              </div>
            </Accordion.Control>
            <Accordion.Panel>
              <div className="flex justify-center items-center">
                loading content ...
              </div>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {!runTaskDataIsLoading && !dataItems && !view_record && (
        <Accordion multiple defaultValue={[view_item_id]}>
          <Accordion.Item value={view_item_id} key={view_item_id}>
            <Accordion.Control>{view_item_record?.name}</Accordion.Control>
            <Accordion.Panel>
              <MonacoEditor
                value={{
                  error: runTaskDataError,
                  runTaskData: runTaskData,
                  runTaskDataIsLoading: runTaskDataIsLoading,
                }}
                language="json"
                height="25vh"
              ></MonacoEditor>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      )}

      {dataItems && view_record && (
        <ViewItem
          dataItems={dataItems}
          view_record={view_record}
          include_components={include_components}
          view_item_id={view_item_id}
          view_item_record={view_item_record}
          query_state={query_state}
          view_query_state={{}}
        />
      )}
    </div>
  );
};

const ViewItemContentEmbed = ({
  dataItems,
  view_record,
  view_item_id,
  view_item_record,
  include_components,
  query_state,
  view_query_state,
}: {
  dataItems?: any;
  view_record?: any;
  view_item_id: string;
  view_item_record: any;
  include_components?: any;
  query_state: any;
  view_query_state: any;
}) => {
  let query = `SELECT * FROM messages WHERE id = ${view_item_id}`;
  const {
    data: messages,
    error: messagesError,
    loading: messagesLoading,
  } = useLiveQuery<Event>(query, "messages");

  let dataItemsRetrieved = dataItems || messages;

  if (messagesLoading) {
    return <div>loading...</div>;
  }

  if (messagesError) {
    return (
      <>
        <MonacoEditor
          value={{
            messagesError: messagesError,
          }}
          language="json"
          height="25vh"
        ></MonacoEditor>
      </>
    );
  }

  return (
    // <>
    //   <MonacoEditor
    //     value={{
    //       query: query,
    //       dataItemsRetrieved: dataItemsRetrieved,
    //     }}
    //   ></MonacoEditor>
    // </>
    <ViewItem
      dataItems={dataItemsRetrieved}
      view_item_id={view_item_id}
      include_components={["toolbar"]}
      view_item_record={view_item_record}
      query_state={{}}
      view_query_state={view_query_state}
    />
  );
};

const ViewItemContentStreamQuery = ({
  dataItems,
  // view_record,
  view_item_id,
  view_item_record,
  include_components,
  query_state,
}: {
  dataItems?: any;
  // view_record?: any;
  view_item_id: string;
  view_item_record: any;
  include_components?: any;
  query_state: any;
}) => {
  const { activeApplication } = useAppStore();
  // let query = `SELECT * FROM messages WHERE id = ${view_item_id}`;
  // const {
  //   data: messages,
  //   error: messagesError,
  //   loading: messagesLoading,
  // } = useLiveQuery<Event>(query, "messages");

  // let dataItemsRetrieved = dataItems || messages;

  let stream_query_state = {
    // id:
    //   activeView?.id ||
    //   activeTask?.id ||
    //   activeSession?.id ||
    //   activeProfile?.id,
    func_name: "stream",
    name: "stream",
    // task_id: activeTask?.id,
    // session_id: activeSession?.id,
    // view_id: activeView?.id,
    // profile_id: activeProfile?.id,
    application_id: activeApplication?.id,
    // user_id: String(user_session?.userProfile?.user?.id),
    // author_id: identity?.email || "guest",
    // view_name: view_item_record?.variables?.summary_message_view,
    success_message_code: "stream",
    content_stream_query_credential_id:
      view_item_record?.variables?.content_stream_query_credential_id,
    query: view_item_record?.variables?.content_stream_query,
  };
  const {
    data: streamData,
    isLoading: streamDataIsLoading,
    error: streamDataError,
  } = useExecuteFunctionWithArgs(stream_query_state);

  let dataItemsRetrieved = streamData?.data?.find
    ? streamData?.data?.find(
        (item: any) =>
          item?.message?.code === stream_query_state?.success_message_code
      )?.data || []
    : null;

  let view_query_state = {
    // id:
    //   activeView?.id ||
    //   activeTask?.id ||
    //   activeSession?.id ||
    //   activeProfile?.id,
    func_name: "fetch_system_views",
    name: "fetch_system_views",
    // task_id: activeTask?.id,
    // session_id: activeSession?.id,
    // view_id: activeView?.id,
    // profile_id: activeProfile?.id,
    application_id: activeApplication?.id,
    // user_id: String(user_session?.userProfile?.user?.id),
    // author_id: identity?.email || "guest",
    view_name: view_item_record?.variables?.summary_message_view,
    success_message_code: "fetch_system_views",
  };
  const {
    data: viewData,
    isLoading: viewIsLoading,
    error: viewError,
  } = useExecuteFunctionWithArgs(view_query_state);

  let view_records = viewData?.data?.find
    ? viewData?.data?.find(
        (item: any) =>
          item?.message?.code === view_query_state?.success_message_code
      )?.data || []
    : null;
  let view_record = view_records ? view_records[0] : null;

  if (streamDataIsLoading) {
    return <div>loading...</div>;
  }

  if (streamDataError) {
    return (
      <>
        <MonacoEditor
          value={{
            streamDataError: streamDataError,
          }}
          language="json"
          height="25vh"
        ></MonacoEditor>
      </>
    );
  }

  return (
    <>
      {/* <MonacoEditor
        value={{
          view_record,
          // viewData: viewData,
          // query: "query",
          // view_item_record: view_item_record?.variables?.content_stream_query,
          // content_stream_query_credential_id:
          //   view_item_record?.variables?.content_stream_query_credential_id,
          // dataItemsRetrieved: dataItemsRetrieved
        }}
      ></MonacoEditor> */}
      <ViewItem
        view_record={view_record}
        dataItems={dataItemsRetrieved}
        view_item_id={view_item_id}
        include_components={["toolbar"]}
        view_item_record={view_item_record}
        query_state={{}}
        view_query_state={view_query_state}
      />
    </>
  );
};

const ViewItem = ({
  dataItems,
  view_record,
  view_item_id,
  view_item_record,
  include_components,
  query_state,
  view_query_state,
}: {
  dataItems: any;
  view_record?: any;
  view_item_id: string;
  view_item_record: any;
  include_components?: any;
  query_state: any;
  view_query_state: any;
}) => {
  const { width } = useViewportSize();
  const { params } = useParsed();
  const isMobile = useIsMobile();
  const {
    activeLayout,
    setActiveLayout,
    isFullWindowDisplay,
    setIsFullWindowDisplay,
    views,
    setViews,
    activeProfile,
    activeApplication,
  } = useAppStore();

  let view_documentation_record = {
    action: {
      id: view_item_record?.id,
      name: view_item_record?.name,
      function: view_item_record?.func_name,
    },
    session: {
      id: view_item_record?.session_id,
    },
    credential: {
      id: view_item_record?.credential_id,
    },
    task: {
      id: view_item_record?.task_id,
      variables: view_item_record?.variables,
    },
    author: {
      id: view_item_record?.author_id,
    },
    timestamp: {
      created_datetime: view_item_record?.created_datetime,
      updated_datetime: view_item_record?.updated_datetime,
    },
    view: {
      id: view_item_record?.view_id,
      fields: view_record?.fields || [],
    },
    status: {
      action_status: view_item_record?.action_status,
    },
  };

  let subheading_object = view_item_record?.variables
    ? extractKeys(
        view_item_record?.variables,
        // [
        //   "application_id",
        //   "profile_id",
        //   "session_id",
        //   "task_id",
        //   "execution_mode",
        //   "breakpoint",
        //   "summary_message_code",
        //   "task_name",
        //   "variables_output",
        //   "message_type",
        //   "variables",
        // ],
        ["variables_value"],
        "include"
      )
    : {};

  // Format the JSON string on a single line
  const formatObject = (obj: any) => {
    return Object.entries(obj)
      .map(([key, value]) => `${key}: ${value}`)
      .join("  •  "); // Using bullet point as separator for better readability
  };

  const subheading = formatObject(subheading_object);

  const toggleFullWindowDisplay = () => {
    setIsFullWindowDisplay(!isFullWindowDisplay);
  };

  const toggleItemFullWindowDisplay = () => {
    toggleFullWindowDisplay();
    if (!isFullWindowDisplay) {
      if (activeLayout) {
        const newLayout = { ...activeLayout };
        newLayout.leftSection.isDisplayed = false;
        newLayout.rightSection.isDisplayed = false;
        setActiveLayout(newLayout);
      }
    } else {
      if (activeLayout) {
        const newLayout = { ...activeLayout };
        newLayout.leftSection.isDisplayed = true;
        newLayout.rightSection.isDisplayed = true;
        setActiveLayout(newLayout);
      }
    }
  };
  const go = useGo();
  let view_ids = Object.keys(views);

  const toggleView = (id: string, record: any) => {
    // Access the current views from your zustand store
    const currentViews = views;

    // Check if the item exists in views
    const existingView = currentViews[id];

    const toggleItemInList = (list: any, itemId: any) => {
      // Check if item exists in list
      const exists = list.includes(itemId);

      if (exists) {
        // If exists, filter it out
        return list.filter((id: string) => id !== itemId);
      } else {
        // If doesn't exist, add it to the list (spreading the existing list)
        return [...list, itemId];
      }
    };

    if (existingView) {
      // Remove the view if it exists
      // const { [id]: removedView, ...remainingViews } = currentViews;
      setViews(id, null);
      let new_view_ids = toggleItemInList(view_ids, id);
      const queryParams: {
        profile_id: string;
        [key: string]: string;
      } = {
        profile_id: String(activeProfile?.id),
      };

      if (new_view_ids?.length > 0) {
        queryParams.view_items = String(new_view_ids);
      }
      go({
        // to: {
        //   resource: "sessions",
        //   action: "show",
        //   id: record?.id,
        // },
        query: queryParams,
        type: "push",
      });
    } else {
      // Add the view if it doesn't exist
      setViews(id, record);
      let new_view_ids = [...view_ids, id];
      const queryParams: {
        profile_id: string;
        [key: string]: string;
      } = {
        profile_id: String(activeProfile?.id),
      };

      if (new_view_ids?.length > 0) {
        queryParams.view_items = String(new_view_ids);
      }
      go({
        // to: {
        //   resource: "sessions",
        //   action: "show",
        //   id: record?.id,
        // },
        query: queryParams,
        type: "push",
      });
    }
  };
  if (!view_item_record) {
    return null;
  }
  // return (
  //   <div>
  //     <MonacoEditor
  //       value={{
  //         title: "View",
  //         dataItems: dataItems,
  //         view_record: view_record,
  //       }}
  //     ></MonacoEditor>
  //   </div>
  // );

  const edges = [
    { in: "A", out: "B", weight: 3 },
    { in: "B", out: "C", weight: 2 },
    { in: "C", out: "A", weight: 1 },
  ];

  // In parent component
  // const handleDataChange = (allData: any, changedRows: any) => {
  //   // Update your local state with all data
  //   // setAllData(allData);

  //   // Optional: You can also submit changes immediately if needed
  //   if (changedRows.length > 0) {
  //     // submitToApi(changedRows);
  //     console.log("submitToApi", changedRows);
  //   }
  // };

  const handleDataChange = (allData, changedRows, changedFields) => {
    // Update your local state with all data
    // setAllData(allData);

    // For immediate API submission, you can use the detailed change information
    if (changedRows.length > 0) {
      const changePayload = changedRows.map((row, index) => {
        const rowId = Object.keys(changedFields)[index];
        return {
          id: row.id, // Assuming each row has an ID
          changedFields: changedFields[rowId],
          // You could also create an object with only changed values
          changedValues: changedFields[rowId].reduce((obj, field) => {
            obj[field] = row[field];
            return obj;
          }, {}),
        };
      });

      // submitToApi(changePayload);
      console.log("submitToApi", changePayload);
    }
  };

  return (
    <>
      <Accordion multiple defaultValue={[view_item_id]}>
        <Accordion.Item value={view_item_id} key={view_item_id}>
          <Accordion.Control>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                {/* <Loader size={18} /> */}
                {/* <ActionStatusInfo record={item} isRerunning={true} /> */}
                {!isMobile &&
                  !view_record?.fields?.length &&
                  dataItems?.map((item: any, index: number) => {
                    if (
                      item?.view_id == "embed_url" ||
                      item?.message_type == "content_embed_url"
                    ) {
                      return (
                        <>
                          <div>
                            {
                              <ActionStatusInfo
                                record={item}
                                isRerunning={true}
                              />
                            }
                          </div>
                        </>
                      );
                      // if (item?.action_status == "running") {
                      //   return <Loader size={18} />;
                      // } else {
                      //   return null;
                      // }
                    } else {
                      return null;
                    }
                  })}

                <div onClick={(e) => e.stopPropagation()}>
                  <Reveal
                    trigger="click"
                    target={
                      <Tooltip
                        multiline
                        w={220}
                        withArrow
                        transitionProps={{ duration: 200 }}
                        // label={getTooltipLabel(view_item_record || {})}
                        label={"click for details"}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1">
                            {/* Main Label - Made larger and bolder */}
                            <div className="text-sm font-semibold text-blue-600 px-3 break-words max-w-xs sm:max-w-md">
                              {getLabel(view_item_record || {})}
                            </div>

                            {/* Subheading - Smaller, lighter color and weight */}
                            <div
                              className="text-xs font-normal text-blue-400 truncate overflow-hidden whitespace-nowrap px-3"
                              // className="text-sm font-normal text-blue-400 truncate"
                              style={{ maxWidth: width < 500 ? 300 : 500 }}
                            >
                              {subheading}
                            </div>
                          </div>
                          <IconInfoCircle
                            // className="text-blue-500 flex-shrink-0"
                            size={12}
                          />
                        </div>
                      </Tooltip>
                    }
                  >
                    {/* <Documentation record={view_record}></Documentation> */}
                    <ViewDocumentation
                      record={view_documentation_record}
                    ></ViewDocumentation>
                  </Reveal>
                </div>
              </div>
              {include_components?.includes("toolbar") && (
                <div className="hidden lg:block">
                  <div
                    className="flex p-3 gap-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ViewItemForm
                      view_item_record={view_item_record}
                      action_form_key={`form_${params?.id}_${view_item_id}`}
                      view_item_id={view_item_id}
                      query_state={query_state}
                      view_record={view_record}
                      view_query_state={view_query_state}
                    ></ViewItemForm>
                  </div>
                </div>
              )}
            </div>
            {include_components?.includes("toolbar") && (
              <div className="block lg:hidden">
                <div
                  className="flex p-3 gap-3 items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isMobile &&
                    !view_record?.fields?.length &&
                    dataItems?.map((item: any, index: number) => {
                      if (
                        item?.view_id == "embed_url" ||
                        item?.message_type == "content_embed_url"
                      ) {
                        return (
                          <>
                            <div>
                              {
                                <ActionStatusInfo
                                  record={item}
                                  isRerunning={true}
                                />
                              }
                            </div>
                          </>
                        );
                      } else {
                        return null;
                      }
                    })}
                  <ExternalSubmitButton
                    record={{}}
                    reference_record={{
                      ...view_item_record,
                      id: view_item_id,
                      queryKey: `useRunTask_${JSON.stringify(query_state)}`,
                      viewQueryKey: `useExecuteFunctionWithArgs_${JSON.stringify(
                        view_query_state
                      )}`,
                    }}
                    view_item={view_record}
                    entity_type="view"
                    action_form_key={`form_${params?.id}_${view_item_id}`}
                    action={"save"}
                  />
                  <Tooltip label="expand/minimize" key="expand/minimize">
                    <ActionIcon
                      variant="default"
                      size="sm"
                      aria-label="expand/minimize"
                      onClick={toggleItemFullWindowDisplay}
                    >
                      <IconMaximize />
                    </ActionIcon>
                  </Tooltip>

                  <Tooltip label="close" key="close">
                    <ActionIcon
                      variant="default"
                      size="sm"
                      aria-label="close"
                      onClick={() =>
                        toggleView(
                          String(view_item_record?.id),
                          view_item_record
                        )
                      }
                    >
                      <IconSquareX />
                    </ActionIcon>
                  </Tooltip>
                </div>
              </div>
            )}
          </Accordion.Control>
          <Accordion.Panel>
            {dataItems &&
              view_record?.fields?.length > 0 &&
              !["graph_relations"]?.includes(
                view_record?.config?.component
              ) && (
                <DataGridView
                  data_fields={view_record?.fields || []}
                  data_items={processDataItems(dataItems)}
                  view_record={view_record}
                  onDataChange={handleDataChange}
                ></DataGridView>
              )}
            {dataItems &&
              view_record?.fields?.length > 0 &&
              view_record?.config?.component === "graph_relations" && (
                <div className="h-[85vh] w-full">
                  <InteractiveGraph edges={dataItems} />
                </div>
              )}

            {!view_record?.fields?.length &&
              (dataItems[0]?.view_id == "embed_url" ||
                dataItems[0]?.message_type == "content_embed_url") &&
              dataItems?.map((item: any, index: number) => {
                if (
                  item?.view_id == "embed_url" ||
                  item?.message_type == "content_embed_url"
                ) {
                  return (
                    <div key={`embed-${index}`} className="h-[75vh]">
                      {item?.content?.embed_url
                        ?.toLowerCase()
                        .startsWith("http") ? (
                        <EmbedComponent
                          embed_url={item?.content?.embed_url}
                        ></EmbedComponent>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="flex flex-col gap-1 items-center">
                            <ActionStatusInfo
                              record={item}
                              isRerunning={true}
                            />
                            <Text c="blue" size="lg">
                              {item?.content?.execution_message}
                            </Text>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  return (
                    <div key={`editor-${index}`}>
                      <MonacoEditor value={item} />
                    </div>
                  );
                }
              })}
            {!view_record?.fields?.length &&
              dataItems[0]?.view_id !== "embed_url" &&
              dataItems[0]?.message_type !== "content_embed_url" && (
                <div key={`editor-${view_ids}`}>
                  <MonacoEditor value={dataItems} height="75vh" />
                </div>
              )}
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </>
  );
};

type JsonObject = { [key: string]: any };

type PathConfig = {
  path: string;
  select?: string[]; // Optional array of keys to keep
};

/**
 * Gets a value from an object using dot notation path
 */
function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => acc?.[part], obj);
}

/**
 * Sets a value in an object using dot notation path
 */
function setByPath(obj: any, path: string, value: any): void {
  const parts = path.split(".");
  const lastPart = parts.pop()!;
  const target = parts.reduce((acc, part) => {
    if (!(part in acc)) acc[part] = {};
    return acc[part];
  }, obj);
  target[lastPart] = value;
}

/**
 * Recursively attempts to parse JSON strings
 */
function deepParseJson(value: any): any {
  if (typeof value !== "string") {
    if (Array.isArray(value)) {
      return value.map(deepParseJson);
    }
    if (typeof value === "object" && value !== null) {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, deepParseJson(v)])
      );
    }
    return value;
  }

  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null) {
      return deepParseJson(parsed);
    }
    return parsed;
  } catch {
    return value;
  }
}

/**
 * Filters an object to only keep specified keys
 */
function filterKeys(obj: any, keys?: string[]): any {
  if (!keys || !obj || typeof obj !== "object") return obj;

  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as JsonObject);
}

/**
 * Deserializes specific JSON fields in objects using dot notation paths
 * @param data - Data to process
 * @param pathConfigs - Array of path configurations specifying what to deserialize and which keys to keep
 */
function deserializeByPaths<T extends JsonObject>(
  data: T[],
  pathConfigs: (string | PathConfig)[]
): T[] {
  // Normalize configs
  const normalizedConfigs = pathConfigs.map((config) =>
    typeof config === "string" ? { path: config } : config
  );

  return data.map((item) => {
    const newItem = { ...item };

    normalizedConfigs.forEach((config) => {
      const value = getByPath(newItem, config.path);
      if (value) {
        const parsed = deepParseJson(value);
        // Filter keys if specified
        const filtered = filterKeys(parsed, config.select);
        setByPath(newItem, config.path, filtered);
      }
    });

    return newItem;
  });
}

export { deserializeByPaths, type PathConfig };
