import React from "react";
import { Text, Box, LoadingOverlay } from "@mantine/core";
import {
  IconClock,
  IconCircleX,
  IconCircleCheck,
  IconCircle,
  IconPlugConnected,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { Icon } from "@tabler/icons-react";
import { useGetIdentity, useParsed } from "@refinedev/core";
import { useAppStore } from "src/store";
import { IIdentity } from "@components/interfaces";

type StatusType = "empty" | "pending" | "running" | "failed" | "passed";

interface StatusConfig {
  icon: Icon;
  color: string;
  bgColor: string;
}

interface RecordItem {
  action_status: StatusType;
  start_datetime: string;
  end_datetime: string;
  execution_order: number;
  action_id: string;
  message?: {
    details?: string;
  };
  needs_connection?: boolean;
  is_connected?: boolean;
  connect?: string;
}

type StatusConfigs = {
  [K in StatusType]: StatusConfig;
};

interface ProcessedItem extends RecordItem {
  name: string;
  action_id: string;
  duration: string;
  endTime: string;
}

interface ExecutionStatusProps {
  parent_record: any;
  record: {
    [key: string]: RecordItem;
  };
  onConnect?: (itemName: string) => void;
}

const getStatusConfig = (status: StatusType): StatusConfig => {
  const configs: StatusConfigs = {
    empty: {
      icon: IconCircle,
      color: "text-gray-400",
      bgColor: "bg-gray-50",
    },
    pending: {
      icon: IconClock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
    running: {
      icon: IconClock,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    failed: {
      icon: IconCircleX,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    passed: {
      icon: IconCircleCheck,
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  };

  return configs[status] || configs.empty;
};

const formatDateTime = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "hh:mm a");
  } catch (error) {
    return "";
  }
};

const calculateDuration = (start: string, end: string): string => {
  try {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const durationMs = endTime.getTime() - startTime.getTime();
    return `${(durationMs / 1000).toFixed(2)}s`;
  } catch (error) {
    return "";
  }
};

interface ConnectionStatusProps {
  isConnected: boolean;
  onConnect?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  onConnect,
}) => {
  if (isConnected) {
    return (
      <div className="flex items-center cursor-pointer">
        <IconPlugConnected className="w-4 h-4 text-green-500" />
      </div>
    );
  }

  return (
    <button
      onClick={onConnect}
      className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors cursor-pointer"
    >
      <IconPlugConnected className="w-4 h-4" />
      Connect
    </button>
  );
};

const ExecutionStatus: React.FC<ExecutionStatusProps> = ({
  parent_record,
  record,
  onConnect,
}) => {
  const { params } = useParsed();
  const { activeSession, activeProfile } = useAppStore();
  const { data: identity } = useGetIdentity<IIdentity>();
  const sortedItems: ProcessedItem[] = Object.entries(record)
    .map(([key, value]) => ({
      name: key,
      ...value,
      duration: calculateDuration(value.start_datetime, value.end_datetime),
      endTime: formatDateTime(value.end_datetime),
    }))
    .sort((a, b) => a.execution_order - b.execution_order);

  const handleConnect = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: ProcessedItem
  ) => {
    if (item.connect) {
      const url = new URL(item.connect);
      const stateParam = url.searchParams.get("state");
      const currentState = stateParam
        ? JSON.parse(decodeURIComponent(stateParam))
        : {};

      // Get current full URL
      const currentUrl = window.location.href;

      const newState = {
        ...currentState,
        frontend_url: currentUrl,
        session_id: params?.id || activeSession?.id,
        profile_id: params?.profile_id || activeProfile?.id || identity?.email,
        message_id: String(parent_record?.id),
        action_id: item.action_id,
        section_title: item.name,
        view_items: params?.view_items,
        author_id: identity?.email,
      };

      url.searchParams.set(
        "state",
        encodeURIComponent(JSON.stringify(newState))
      );
      window.location.href = url.toString();
    }
  };

  return (
    <Box className="w-full max-w-4xl">
      <div className="space-y-2">
        {sortedItems.map((item) => {
          const config = getStatusConfig(item.action_status);
          const StatusIcon = config.icon;
          // const showConnectionStatus = item.needs_connection;
          const showConnectionStatus = true;

          return (
            <div
              key={item.name}
              className="p-2 rounded-md border bg-white hover:bg-gray-50 transition-colors"
            >
              {/* First Row */}
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-2">
                  {item.action_status === "running" ? (
                    <Box pos="relative" className="w-6 h-6">
                      <LoadingOverlay
                        visible={true}
                        zIndex={1000}
                        overlayProps={{ radius: "sm", blur: 2 }}
                        loaderProps={{
                          color: "blue",
                          size: "xs",
                          type: "dots",
                        }}
                      />
                    </Box>
                  ) : (
                    <div className={`p-1 rounded-full ${config.bgColor}`}>
                      <StatusIcon
                        className={`w-4 h-4 ${config.color}`}
                        stroke={2}
                      />
                    </div>
                  )}
                  <Text className="text-xs font-medium">
                    #{item.execution_order}
                  </Text>
                </div>

                <Text
                  className="font-medium text-sm truncate flex-1"
                  title={item.name}
                >
                  {item.name}
                </Text>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <IconClock className="w-3 h-3" stroke={1.5} />
                    <span>{item.duration}</span>
                  </div>
                  <Text size="xs" className="text-gray-500">
                    {item.endTime}
                  </Text>
                </div>
              </div>

              {/* Second Row with Message and Connection Status */}
              <div className="pl-6 flex items-center justify-between">
                <Text size="xs" className="text-gray-500">
                  {item?.message?.details}
                </Text>
                {showConnectionStatus && (
                  <ConnectionStatus
                    isConnected={
                      !(item?.connect && item?.connect !== "success")
                    }
                    onConnect={(e) => handleConnect(e, item)}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Box>
  );
};

export default ExecutionStatus;
