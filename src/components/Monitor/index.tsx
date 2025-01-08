import { useReadRecordByState } from "@components/Utils";
import { ActionIcon, MultiSelect, TextInput, Tooltip } from "@mantine/core";
import TableView from "@components/TableView";
import ExplorerWrapper from "@components/Explorer";
import { useEffect, useState } from "react";
import { useGo, useParsed } from "@refinedev/core";
import { IconIconsOff } from "@tabler/icons-react";
import { useAppStore } from "src/store";
import MonacoEditor from "@components/MonacoEditor";
import { useLiveQuery } from "@components/Utils/useLiveQuery";

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
  const { params } = useParsed();
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

  // actions

  const actions_default_view_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: "views:5023b2twax164esuobo3",
    record: {
      id: "views:5023b2twax164esuobo3",
    },
    read_record_mode: "remote",
  };

  const {
    data: actionsViewData,
    isLoading: actionsViewIsLoading,
    error: actionsViewError,
  } = useReadRecordByState(actions_default_view_record_state);

  const {
    data: actions,
    error: actionsError,
    loading: actionsLoading,
  } = useLiveQuery<Event>(
    `SELECT * FROM actions WHERE session_id = ${params?.id} ORDER BY updated_datetime ASC`,
    "actions"
  );

  // automations
  const automations_default_view_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: "views:5023b2twax164esuobo3",
    record: {
      id: "views:5023b2twax164esuobo3",
    },
    read_record_mode: "remote",
  };

  const {
    data: automationsViewData,
    isLoading: automationsViewIsLoading,
    error: automationsViewError,
  } = useReadRecordByState(automations_default_view_record_state);

  const {
    data: automations,
    error: automationsError,
    loading: automationsLoading,
  } = useLiveQuery<Event>(
    `SELECT * FROM automations WHERE session_id = '${params?.id}' ORDER BY updated_datetime ASC`,
    "automations"
  );

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
    `SELECT * FROM messages WHERE session_id = ${params?.id} ORDER BY created_datetime DESC`,
    "messages"
  );

  let go = useGo();

  const handleClearViews = () => {
    go({
      query: {
        profile_id: String(activeProfile?.id),
      },
      type: "push",
    });
    setShowRequestResponseView(false);
    clearViews({});
  };

  const actionsViewRecord = actionsViewData?.data?.find(
    (item: any) =>
      item?.message?.code ===
      actions_default_view_record_state?.success_message_code
  )?.data[0];

  const automationsViewRecord = automationsViewData?.data?.find(
    (item: any) =>
      item?.message?.code ===
      automations_default_view_record_state?.success_message_code
  )?.data[0];

  // // Add useEffect for debugging
  // useEffect(() => {
  //   console.log("Actions LiveQuery Update:", {
  //     actions,
  //     loading: actionsLoading,
  //     error: actionsError,
  //     sessionId: params?.id,
  //   });
  // }, [actions, actionsLoading, actionsError, params?.id]);

  if (
    actionsLoading ||
    actionsViewIsLoading ||
    automationsLoading ||
    automationsViewIsLoading ||
    messagesViewIsLoading
  ) {
    return <div>Loading...</div>;
  }

  if (
    actionsError ||
    actionsViewError ||
    automationsError ||
    automationsViewError ||
    messagesError ||
    messagesViewError
  ) {
    return (
      <MonacoEditor
        value={{
          actionsError: actionsError?.message,
          actionsViewError: actionsViewError?.response?.data,
          automationsError: automationsError?.message,
          automationsViewError: automationsViewError?.response?.data,
          messagesError: messagesError?.message,
          messagesViewError: messagesViewError?.response?.data,
        }}
        height="25vh"
      ></MonacoEditor>
    );
  }

  return (
    <div className="flex flex-col p-3 gap-2 h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center gap-1">
        <div className="w-full">
          <MultiSelect
            size="xs"
            placeholder="view"
            value={monitorComponents}
            data={["actions", "profile explorer", "automations", "messages"]}
            onChange={setMonitorComponents}
            searchable
            clearable
          />
        </div>
        {/* <TextInput size="xs" placeholder="search" /> */}
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

      {monitorComponents?.includes("profile explorer") && (
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
      )}

      {actions &&
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
        )}
      {messages &&
        messagesViewRecord &&
        monitorComponents?.includes("messages") && (
          <>
            <MultiSelect
              size="xs"
              placeholder="filter"
              value={["messages"]}
              data={["messages"]}
              searchable
              clearable
              disabled
            />
            <TableView
              data_fields={messagesViewRecord?.fields}
              data_items={messages}
              view_record={messagesViewRecord}
            />
          </>
        )}
      {automations &&
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
        )}
    </div>
  );
};

export default MonitorWrapper;
