import { useReadRecordByState } from "@components/Utils";
import { ActionIcon, MultiSelect, TextInput, Tooltip } from "@mantine/core";
import TableView from "@components/TableView";
import ExplorerWrapper from "@components/Explorer";
import { useState } from "react";
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
  const [monitorComponents, setMonitorComponents] = useState(["monitor"]);
  const {
    activeProfile,
    clearViews,
    setShowRequestResponseView,
    showRequestResponseView,
    views,
  } = useAppStore();

  const monitor_default_view_record_state = {
    credential: "surrealdb catchmytask dev",
    success_message_code: "views:5023b2twax164esuobo3",
    record: {
      id: "views:5023b2twax164esuobo3",
    },
    read_record_mode: "remote",
  };

  const {
    data: monitorViewData,
    isLoading: monitorViewIsLoading,
    error: monitorViewError,
  } = useReadRecordByState(monitor_default_view_record_state);

  const {
    data: actions,
    error: actionsError,
    loading: actionsLoading,
  } = useLiveQuery<Event>("actions", `session_id = "${params?.id}"`);

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

  const monitorViewRecord = monitorViewData?.data?.find(
    (item: any) =>
      item?.message?.code ===
      monitor_default_view_record_state?.success_message_code
  )?.data[0];

  if (actionsLoading || monitorViewIsLoading) {
    return <div>Loading...</div>;
  }

  if (actionsError || monitorViewError) {
    return (
      <MonacoEditor
        value={{
          actionsError: actionsError?.message,
          monitorViewError: monitorViewError?.response?.data,
        }}
        height="25vh"
      ></MonacoEditor>
    );
  }

  return (
    <div className="flex flex-col p-3 gap-2 h-[75vh] overflow-y-auto">
      <div className="flex justify-between items-center gap-1">
        <MultiSelect
          size="xs"
          placeholder="view"
          value={monitorComponents}
          data={["monitor", "explorer"]}
          onChange={setMonitorComponents}
          searchable
          clearable
        />
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

      {monitorComponents?.includes("explorer") && (
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
        monitorViewRecord &&
        monitorComponents?.includes("monitor") && (
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
              data_fields={monitorViewRecord?.fields}
              data_items={actions}
              view_record={monitorViewRecord}
            />
          </>
        )}
    </div>
  );
};

export default MonitorWrapper;
