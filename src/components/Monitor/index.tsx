import { useReadRecordByState } from "@components/Utils";
import {
  Accordion,
  ActionIcon,
  MultiSelect,
  TextInput,
  Tooltip,
  Text,
} from "@mantine/core";
import TableView from "@components/TableView";
import ExplorerWrapper from "@components/Explorer";
import { useEffect, useState } from "react";
import { useGetIdentity, useGo, useParsed } from "@refinedev/core";
import { IconIconsOff } from "@tabler/icons-react";
import { useAppStore } from "src/store";
import MonacoEditor from "@components/MonacoEditor";
import { useLiveQuery } from "@components/Utils/useLiveQuery";
import { useSession } from "next-auth/react";
import AccordionComponent from "@components/AccordionComponent";
import { viewSearchActionAccordionConfig } from "@components/Layout/viewSearchActionAccordionConfig";
import { useQueryClient } from "@tanstack/react-query";
import ActionInputWrapper from "@components/ActionInput";
import ActionToolbar from "@components/ActionToolbar";
import SessionMemoryToolbar from "@components/SessionMemoryToolbar";
import { IIdentity } from "@components/interfaces";
import EmbedComponent from "@components/EmbedComponent";

interface MonitorWrapperProps {
  display_mode?: string;
  view_id?: string;
  query_name?: string;
  success_message_code?: string;
  author_id?: string;
  title?: string;
}

export const MonitorWrapper = ({
  display_mode,
  view_id,
  query_name,
  success_message_code,
  author_id,
  title,
}: MonitorWrapperProps) => {
  const { params, pathname } = useParsed();
  const { data: user_session } = useSession();
  // const [monitorComponents, setMonitorComponents] = useState(["actions"]);

  const {
    activeProfile,
    clearViews,
    setShowRequestResponseView,
    showRequestResponseView,
    views,
    monitorComponents,
    setMonitorComponents,
    showSessionWorkingMemory,
    sectionIsExpanded,
    setSectionIsExpanded,
    activeInput,
    setActiveInput,
    activeLayout,
    setActiveLayout,
    activeSession,
    displaySessionEmbedMonitor,
  } = useAppStore();

  // // actions

  // const actions_default_view_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: "views:5023b2twax164esuobo3",
  //   record: {
  //     id: "views:5023b2twax164esuobo3",
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: actionsViewData,
  //   isLoading: actionsViewIsLoading,
  //   error: actionsViewError,
  // } = useReadRecordByState(actions_default_view_record_state);

  // const {
  //   data: actions,
  //   error: actionsError,
  //   loading: actionsLoading,
  // } = useLiveQuery<Event>(
  //   `SELECT * FROM actions WHERE session_id = ${params?.id} ORDER BY updated_datetime ASC`,
  //   "actions"
  // );

  // // automations
  // const automations_default_view_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: "views:5023b2twax164esuobo3",
  //   record: {
  //     id: "views:5023b2twax164esuobo3",
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: automationsViewData,
  //   isLoading: automationsViewIsLoading,
  //   error: automationsViewError,
  // } = useReadRecordByState(automations_default_view_record_state);

  // const {
  //   data: automations,
  //   error: automationsError,
  //   loading: automationsLoading,
  // } = useLiveQuery<Event>(
  //   `SELECT * FROM automations WHERE session_id = '${params?.id}' ORDER BY updated_datetime ASC`,
  //   "automations"
  // );

  // // messages

  // const messages_default_view_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: "views:5023b2twax164esuobo3",
  //   record: {
  //     id: "views:cbhchg1orlmae045ufys",
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: messagesViewData,
  //   isLoading: messagesViewIsLoading,
  //   error: messagesViewError,
  // } = useReadRecordByState(messages_default_view_record_state);

  // const messagesViewRecord = messagesViewData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code ===
  //     messages_default_view_record_state?.success_message_code
  // )?.data[0];

  // const {
  //   data: messages,
  //   error: messagesError,
  //   loading: messagesLoading,
  // } = useLiveQuery<Event>(
  //   `SELECT * FROM messages WHERE session_id = ${params?.id} ORDER BY created_datetime DESC`,
  //   "messages"
  // );

  // const queryClient = useQueryClient();
  // // const viewData = queryClient.getQueryData([view_query_key]);
  // const responseData = queryClient.getQueryData(["main_form_request"]) as {
  //   data: any;
  //   response: any;
  // };

  // let go = useGo();

  // const handleClearViews = () => {
  //   go({
  //     query: {
  //       profile_id: String(activeProfile?.id),
  //     },
  //     type: "push",
  //   });
  //   setShowRequestResponseView(false);
  //   clearViews({});
  // };

  // const actionsViewRecord = actionsViewData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code ===
  //     actions_default_view_record_state?.success_message_code
  // )?.data[0];

  // const automationsViewRecord = automationsViewData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code ===
  //     automations_default_view_record_state?.success_message_code
  // )?.data[0];

  // // Add useEffect for debugging
  // useEffect(() => {
  //   console.log("Actions LiveQuery Update:", {
  //     actions,
  //     loading: actionsLoading,
  //     error: actionsError,
  //     sessionId: params?.id,
  //   });
  // }, [actions, actionsLoading, actionsError, params?.id]);

  // if (
  //   actionsLoading ||
  //   actionsViewIsLoading ||
  //   automationsLoading ||
  //   automationsViewIsLoading ||
  //   messagesViewIsLoading
  // ) {
  //   return <div>Loading...</div>;
  // }

  // if (
  //   actionsError ||
  //   actionsViewError ||
  //   automationsError ||
  //   automationsViewError ||
  //   messagesError ||
  //   messagesViewError
  // ) {
  //   return (
  //     <MonacoEditor
  //       value={{
  //         actionsError: actionsError?.message,
  //         actionsViewError: actionsViewError?.response?.data,
  //         automationsError: automationsError?.message,
  //         automationsViewError: automationsViewError?.response?.data,
  //         messagesError: messagesError?.message,
  //         messagesViewError: messagesViewError?.response?.data,
  //       }}
  //       height="25vh"
  //     ></MonacoEditor>
  //   );
  // }

  let displaySessionEmbedMonitor_link = activeSession?.links
    ? activeSession?.links.find(
        (item: any) => item?.name == "session_embed_monitor"
      )
    : null;
  let displayHomeMessages = true;
  return (
    <div className="flex flex-col p-3 gap-2 h-[85vh] overflow-y-auto">
      {/* {displayHomeMessages && pathname == "/home" && (
        <div>home messages: {JSON.stringify(pathname)}</div>
      )} */}
      {displaySessionEmbedMonitor && displaySessionEmbedMonitor_link?.url && (
        <EmbedComponent
          embed_url={displaySessionEmbedMonitor_link?.url}
        ></EmbedComponent>
      )}
      {pathname !== "/home" && <MonitorMessages></MonitorMessages>}

      {/* {showSessionWorkingMemory && <MonitorMemory></MonitorMemory>} */}

      {/* {user_session?.userProfile?.monitor_options?.length > 1 && (
        <div className="flex justify-between items-center gap-1">
          <div className="w-full">
            <MultiSelect
              size="xs"
              placeholder="view"
              value={monitorComponents}
              data={user_session?.userProfile?.monitor_options || []}
              onChange={setMonitorComponents}
              searchable
              clearable
            />
          </div>
          <TextInput size="xs" placeholder="search" />
          <Tooltip
            withArrow
            transitionProps={{ duration: 200 }}
            label="clear views"
          >
            <ActionIcon
              size="xs"
              variant={
                showRequestResponseView || Object.keys(views).length > 0
                  ? "filled"
                  : "outline"
              }
              aria-label="clear view"
              onClick={handleClearViews}
            >
              <IconIconsOff size={24} />
            </ActionIcon>
          </Tooltip>
        </div>
      )} */}

      {/* {monitorComponents?.includes("profile explorer") && (
        <>
          <MultiSelect
            size="xs"
            placeholder="filter"
            value={["profile"]}
            data={["profile"]}
            searchable
            clearable
            disabled
          />
          <ExplorerWrapper />
        </>
      )} */}

      {/* {actions &&
        actionsViewRecord &&
        monitorComponents?.includes("actions") && (
          <>
            <MultiSelect
              size="xs"
              placeholder="filter"
              value={["actions"]}
              data={["actions"]}
              searchable
              clearable
              disabled
            />
            <TableView
              data_fields={actionsViewRecord?.fields}
              data_items={actions}
              view_record={actionsViewRecord}
            />
          </>
        )} */}
      {/* {messages &&
        messagesViewRecord &&
        monitorComponents?.includes("messages") && (
          <>
         
            <TableView
              data_fields={messagesViewRecord?.fields}
              data_items={messages}
              view_record={messagesViewRecord}
            />
          </>
        )} */}
      {/* {automations &&
        automationsViewRecord &&
        monitorComponents?.includes("automations") && (
          <>
            <MultiSelect
              size="xs"
              placeholder="filter"
              value={["automations"]}
              data={["automations"]}
              searchable
              clearable
              disabled
            />
            <TableView
              data_fields={automationsViewRecord?.fields}
              data_items={automations}
              view_record={automationsViewRecord}
            />
          </>
        )} */}
      {/* {user_session?.userProfile?.monitor_options?.includes("memory") && (
        <div>
          <div>
            <Accordion multiple defaultValue={[]}>
              <Accordion.Item value={"memory"} key={"memory"}>
                <Accordion.Control icon={null}>
                  <Text fw={600}>memory</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <MonacoEditor
                    value={{
                      responseData: responseData,
                    }}
                    height="65vh"
                    language="json"
                  ></MonacoEditor>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
           
          </div>
        </div>
      )} */}
    </div>
  );
};

export default MonitorWrapper;

interface MonitorMessages {
  display_mode?: string;
  view_id?: string;
  query_name?: string;
  success_message_code?: string;
  author_id?: string;
  title?: string;
}

export const MonitorMessages = ({
  display_mode,
  view_id,
  query_name,
  success_message_code,
  author_id,
  title,
}: MonitorWrapperProps) => {
  const { params } = useParsed();
  const { data: user_session } = useSession();
  // const [monitorComponents, setMonitorComponents] = useState(["actions"]);
  const {
    activeProfile,
    clearViews,
    setShowRequestResponseView,
    showRequestResponseView,
    views,
    monitorComponents,
    setMonitorComponents,
  } = useAppStore();
  const { data: identity } = useGetIdentity<IIdentity>();

  // actions

  // const actions_default_view_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: "views:5023b2twax164esuobo3",
  //   record: {
  //     id: "views:5023b2twax164esuobo3",
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: actionsViewData,
  //   isLoading: actionsViewIsLoading,
  //   error: actionsViewError,
  // } = useReadRecordByState(actions_default_view_record_state);

  // const {
  //   data: actions,
  //   error: actionsError,
  //   loading: actionsLoading,
  // } = useLiveQuery<Event>(
  //   `SELECT * FROM actions WHERE session_id = ${params?.id} ORDER BY updated_datetime ASC`,
  //   "actions"
  // );

  // automations
  // const automations_default_view_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: "views:5023b2twax164esuobo3",
  //   record: {
  //     id: "views:5023b2twax164esuobo3",
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: automationsViewData,
  //   isLoading: automationsViewIsLoading,
  //   error: automationsViewError,
  // } = useReadRecordByState(automations_default_view_record_state);

  // const {
  //   data: automations,
  //   error: automationsError,
  //   loading: automationsLoading,
  // } = useLiveQuery<Event>(
  //   `SELECT * FROM automations WHERE session_id = '${params?.id}' ORDER BY updated_datetime ASC`,
  //   "automations"
  // );

  // messages

  const messages_default_view_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: "views:5023b2twax164esuobo3",
    record: {
      id: "views:cbhchg1orlmae045ufys",
    },
    read_record_mode: "remote",
  };

  const {
    data: messagesViewData,
    isLoading: messagesViewIsLoading,
    error: messagesViewError,
  } = useReadRecordByState(messages_default_view_record_state);

  const messagesViewRecord = messagesViewData?.data?.find(
    (item: any) =>
      item?.message?.code ===
      messages_default_view_record_state?.success_message_code
  )?.data[0];

  const {
    data: messages,
    error: messagesError,
    loading: messagesLoading,
  } = useLiveQuery<Event>(
    `SELECT * FROM messages WHERE session_id = ${params?.id} AND author_id = '${identity?.email}' ORDER BY created_datetime DESC`,
    "messages"
  );

  // const queryClient = useQueryClient();
  // // const viewData = queryClient.getQueryData([view_query_key]);
  // const responseData = queryClient.getQueryData(["main_form_request"]) as {
  //   data: any;
  //   response: any;
  // };

  // let go = useGo();

  // const handleClearViews = () => {
  //   go({
  //     query: {
  //       profile_id: String(activeProfile?.id),
  //     },
  //     type: "push",
  //   });
  //   setShowRequestResponseView(false);
  //   clearViews({});
  // };

  // const actionsViewRecord = actionsViewData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code ===
  //     actions_default_view_record_state?.success_message_code
  // )?.data[0];

  // const automationsViewRecord = automationsViewData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code ===
  //     automations_default_view_record_state?.success_message_code
  // )?.data[0];

  // // Add useEffect for debugging
  // useEffect(() => {
  //   console.log("Actions LiveQuery Update:", {
  //     actions,
  //     loading: actionsLoading,
  //     error: actionsError,
  //     sessionId: params?.id,
  //   });
  // }, [actions, actionsLoading, actionsError, params?.id]);

  if (messagesViewIsLoading) {
    return <div>Loading...</div>;
  }

  if (messagesError || messagesViewError) {
    return (
      <MonacoEditor
        value={{
          messagesError: messagesError?.message,
          messagesViewError: messagesViewError?.response?.data,
        }}
        height="25vh"
      ></MonacoEditor>
    );
  }

  return (
    <div className="flex flex-col p-3 gap-2 h-[85vh] overflow-y-auto">
      {/* {user_session?.userProfile?.monitor_options?.length > 1 && (
        <div className="flex justify-between items-center gap-1">
          <div className="w-full">
            <MultiSelect
              size="xs"
              placeholder="view"
              value={monitorComponents}
              data={user_session?.userProfile?.monitor_options || []}
              onChange={setMonitorComponents}
              searchable
              clearable
            />
          </div>
          <TextInput size="xs" placeholder="search" />
          <Tooltip
            withArrow
            transitionProps={{ duration: 200 }}
            label="clear views"
          >
            <ActionIcon
              size="xs"
              variant={
                showRequestResponseView || Object.keys(views).length > 0
                  ? "filled"
                  : "outline"
              }
              aria-label="clear view"
              onClick={handleClearViews}
            >
              <IconIconsOff size={24} />
            </ActionIcon>
          </Tooltip>
        </div>
      )} */}

      {/* {monitorComponents?.includes("profile explorer") && (
        <>
          <MultiSelect
            size="xs"
            placeholder="filter"
            value={["profile"]}
            data={["profile"]}
            searchable
            clearable
            disabled
          />
          <ExplorerWrapper />
        </>
      )} */}

      {/* {actions &&
        actionsViewRecord &&
        monitorComponents?.includes("actions") && (
          <>
            <MultiSelect
              size="xs"
              placeholder="filter"
              value={["actions"]}
              data={["actions"]}
              searchable
              clearable
              disabled
            />
            <TableView
              data_fields={actionsViewRecord?.fields}
              data_items={actions}
              view_record={actionsViewRecord}
            />
          </>
        )} */}
      {messages &&
        messagesViewRecord &&
        monitorComponents?.includes("messages") && (
          <>
            {/* <MultiSelect
              size="xs"
              // placeholder="filter"
              value={["messages"]}
              data={["messages"]}
              searchable
              clearable
              disabled
            /> */}
            <TableView
              data_fields={messagesViewRecord?.fields}
              data_items={messages}
              view_record={messagesViewRecord}
            />
          </>
        )}
      {/* {automations &&
        automationsViewRecord &&
        monitorComponents?.includes("automations") && (
          <>
            <MultiSelect
              size="xs"
              placeholder="filter"
              value={["automations"]}
              data={["automations"]}
              searchable
              clearable
              disabled
            />
            <TableView
              data_fields={automationsViewRecord?.fields}
              data_items={automations}
              view_record={automationsViewRecord}
            />
          </>
        )} */}
      {/* {user_session?.userProfile?.monitor_options?.includes("memory") && (
        <div>
          <div>
            <Accordion multiple defaultValue={[]}>
              <Accordion.Item value={"memory"} key={"memory"}>
                <Accordion.Control icon={null}>
                  <Text fw={600}>memory</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <MonacoEditor
                    value={{
                      responseData: responseData,
                    }}
                    height="65vh"
                    language="json"
                  ></MonacoEditor>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
           
          </div>
        </div>
      )} */}
    </div>
  );
};

interface MonitorMemory {
  display_mode?: string;
  view_id?: string;
  query_name?: string;
  success_message_code?: string;
  author_id?: string;
  title?: string;
}

export const MonitorMemory = ({
  display_mode,
  view_id,
  query_name,
  success_message_code,
  author_id,
  title,
}: MonitorWrapperProps) => {
  const { params } = useParsed();
  const { data: user_session } = useSession();
  // const [monitorComponents, setMonitorComponents] = useState(["actions"]);
  const {
    activeProfile,
    clearViews,
    setShowRequestResponseView,
    showRequestResponseView,
    views,
    monitorComponents,
    setMonitorComponents,
    showSessionWorkingMemory,
    sectionIsExpanded,
    setSectionIsExpanded,
    activeInput,
    setActiveInput,
    activeLayout,
    setActiveLayout,
  } = useAppStore();

  const closeDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = false;
      setActiveLayout(newLayout);
    }
  };

  // actions

  // const actions_default_view_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: "views:5023b2twax164esuobo3",
  //   record: {
  //     id: "views:5023b2twax164esuobo3",
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: actionsViewData,
  //   isLoading: actionsViewIsLoading,
  //   error: actionsViewError,
  // } = useReadRecordByState(actions_default_view_record_state);

  // const {
  //   data: actions,
  //   error: actionsError,
  //   loading: actionsLoading,
  // } = useLiveQuery<Event>(
  //   `SELECT * FROM actions WHERE session_id = ${params?.id} ORDER BY updated_datetime ASC`,
  //   "actions"
  // );

  // // automations
  // const automations_default_view_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: "views:5023b2twax164esuobo3",
  //   record: {
  //     id: "views:5023b2twax164esuobo3",
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: automationsViewData,
  //   isLoading: automationsViewIsLoading,
  //   error: automationsViewError,
  // } = useReadRecordByState(automations_default_view_record_state);

  // const {
  //   data: automations,
  //   error: automationsError,
  //   loading: automationsLoading,
  // } = useLiveQuery<Event>(
  //   `SELECT * FROM automations WHERE session_id = '${params?.id}' ORDER BY updated_datetime ASC`,
  //   "automations"
  // );

  // messages

  // const messages_default_view_record_state = {
  //   credential: "surrealdb catchmytask dev",
  //   success_message_code: "views:5023b2twax164esuobo3",
  //   record: {
  //     id: "views:cbhchg1orlmae045ufys",
  //   },
  //   read_record_mode: "remote",
  // };

  // const {
  //   data: messagesViewData,
  //   isLoading: messagesViewIsLoading,
  //   error: messagesViewError,
  // } = useReadRecordByState(messages_default_view_record_state);

  // const messagesViewRecord = messagesViewData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code ===
  //     messages_default_view_record_state?.success_message_code
  // )?.data[0];

  let working_memory_name = params?.id ? params?.id?.replace(":", "_") : null;

  const {
    data: messages,
    error: messagesError,
    loading: messagesLoading,
  } = useLiveQuery<Event>(
    `SELECT * FROM messages WHERE session_id = ${params?.id} AND name = '${working_memory_name}' ORDER BY created_datetime DESC`,
    "messages"
  );

  // const queryClient = useQueryClient();
  // // const viewData = queryClient.getQueryData([view_query_key]);
  // const responseData = queryClient.getQueryData(["main_form_request"]) as {
  //   data: any;
  //   response: any;
  // };

  // let go = useGo();

  // const handleClearViews = () => {
  //   go({
  //     query: {
  //       profile_id: String(activeProfile?.id),
  //     },
  //     type: "push",
  //   });
  //   setShowRequestResponseView(false);
  //   clearViews({});
  // };

  // const actionsViewRecord = actionsViewData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code ===
  //     actions_default_view_record_state?.success_message_code
  // )?.data[0];

  // const automationsViewRecord = automationsViewData?.data?.find(
  //   (item: any) =>
  //     item?.message?.code ===
  //     automations_default_view_record_state?.success_message_code
  // )?.data[0];

  // // Add useEffect for debugging
  // useEffect(() => {
  //   console.log("Actions LiveQuery Update:", {
  //     actions,
  //     loading: actionsLoading,
  //     error: actionsError,
  //     sessionId: params?.id,
  //   });
  // }, [actions, actionsLoading, actionsError, params?.id]);

  // if (
  //   actionsLoading ||
  //   actionsViewIsLoading ||
  //   automationsLoading ||
  //   automationsViewIsLoading ||
  //   messagesViewIsLoading
  // ) {
  //   return <div>Loading...</div>;
  // }

  // if (
  //   actionsError ||
  //   actionsViewError ||
  //   automationsError ||
  //   automationsViewError ||
  //   messagesError ||
  //   messagesViewError
  // ) {
  //   return (
  //     <MonacoEditor
  //       value={{
  //         actionsError: actionsError?.message,
  //         actionsViewError: actionsViewError?.response?.data,
  //         automationsError: automationsError?.message,
  //         automationsViewError: automationsViewError?.response?.data,
  //         messagesError: messagesError?.message,
  //         messagesViewError: messagesViewError?.response?.data,
  //       }}
  //       height="25vh"
  //     ></MonacoEditor>
  //   );
  // }

  return (
    <>
      {messages && (
        <div>
          {/* <MonacoEditor
            value={{
              messages,
            }}
            height="25vh"
          ></MonacoEditor>{" "} */}
          <div>
            {/* <div>memory</div> */}
            <SessionMemoryToolbar
              params={params}
              userSession={user_session}
              activeInput={activeInput}
              setActiveInput={setActiveInput}
              sectionIsExpanded={sectionIsExpanded}
              setSectionIsExpanded={setSectionIsExpanded}
              closeDisplay={closeDisplay}
              includeComponents={["toolbar"]}
            />
            {/* <MonacoEditor
              value={{
                // working_memory_query: `SELECT * FROM messages WHERE session_id = ${params?.id} AND name = '${working_memory_name}' ORDER BY created_datetime DESC`,
                ...messages,
              }}
              height="25vh"
            ></MonacoEditor>{" "} */}
            <ActionInputWrapper
              data_model="manage memory"
              query_name="data_model"
              record={{ working_memory: messages }}
              read_record_mode="local"
              action="query"
              action_form_key={`form_${params?.id}_memory`}
              success_message_code="user_mode_query_input"
            />
            {/* <MonacoEditor value={{}} height="65vh"></MonacoEditor> */}
          </div>
        </div>
      )}
    </>
  );
};
