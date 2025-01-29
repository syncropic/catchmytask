import React, { useCallback } from "react";
import {
  format,
  isValid,
  parseISO,
  isToday,
  isYesterday,
  differenceInYears,
} from "date-fns";
import { Tooltip, Text, Box, LoadingOverlay, Button } from "@mantine/core";
import {
  IconCircle,
  IconClock,
  IconCircleX,
  IconCircleCheck,
  IconQuestionMark,
  IconPlayerPlay,
  IconX,
  IconChevronUp,
  IconChevronDown,
} from "@tabler/icons-react";
import { useCustomMutation, useGetIdentity, useParsed } from "@refinedev/core";
import { useAppStore } from "src/store";
import { IIdentity } from "@components/interfaces";
import { useSession } from "next-auth/react";
import { useIsMobile } from "@components/Utils";

type ActionStatus =
  | "empty"
  | "pending"
  | "scheduled"
  | "running"
  | "failed"
  | "passed";

interface StatusConfig {
  icon: typeof IconQuestionMark;
  color: string;
  bgColor: string;
}

interface MessageLabelRecord {
  updated_datetime?: string | Date | null;
  created_datetime?: string | Date | null;
  title?: string;
  name?: string;
  excerpt?: string;
  description?: string;
  author_id?: string;
  task_id?: string;
  action_status?: ActionStatus;
  variables?: Record<string, any>;
  id: string;
}

interface MessageLabelProps {
  record: MessageLabelRecord;
  onRerun?: (record: MessageLabelRecord) => void;
  onCancel?: (record: MessageLabelRecord) => void;
  showCollapse?: boolean;
}

const extractKeys = (
  obj: Record<string, any>,
  keys: string[],
  mode: "include" | "exclude" = "include"
): Record<string, any> => {
  if (!obj) return {};

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const shouldInclude =
      mode === "include" ? keys.includes(key) : !keys.includes(key);

    if (shouldInclude) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
};

const getStatusConfig = (status?: ActionStatus): StatusConfig => {
  const configs: Record<ActionStatus, StatusConfig> = {
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
    scheduled: {
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

  return configs[status || "empty"] || configs.empty;
};

export const ActionStatusInfo: React.FC<{
  record: MessageLabelRecord;
  onRerun?: (record: MessageLabelRecord) => void;
  onCancel?: (record: MessageLabelRecord) => void;
  isRerunning?: boolean;
  showCollapse?: boolean;
}> = ({ record, onRerun, onCancel, isRerunning, showCollapse }) => {
  const { data: user_session } = useSession();
  const { expandedRecordIds, setExpandedRecordIds } = useAppStore();

  const isExpanded =
    String(record.id) && expandedRecordIds.includes(String(record.id));

  const handleExpandToggle = useCallback(() => {
    if (!record.id) return;
    if (isExpanded) {
      setExpandedRecordIds([]);
    } else {
      setExpandedRecordIds([String(record.id)]);
    }
  }, [record.id, isExpanded, setExpandedRecordIds]);

  const config = getStatusConfig(record.action_status);
  const StatusIcon = config.icon;

  const renderContent = () => {
    if (record.action_status === "running") {
      return (
        <div className="flex items-center">
          <Tooltip label="running -> click to pause" position="top">
            <span className="text-sm">
              <Box pos="relative">
                <LoadingOverlay
                  visible={true}
                  zIndex={1000}
                  overlayProps={{ radius: "sm", blur: 8 }}
                  loaderProps={{ color: "blue", size: "xs", type: "dots" }}
                />
                loading
              </Box>
            </span>
          </Tooltip>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <div className={`p-1 rounded-full ${config.bgColor}`}>
          <StatusIcon className={`w-4 h-4 ${config.color}`} stroke={2} />
        </div>
        <span className={`text-sm ${config.color} font-medium`}>
          {record.action_status || "No status"}
        </span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between gap-2">
      {renderContent()}
      <div className="flex items-center gap-2">
        {!["running", "pending"].includes(record.action_status || "") &&
          !isRerunning &&
          user_session?.userProfile?.permissions?.includes(
            "execute_action_re_run"
          ) && (
            <Button
              size="xs"
              variant="light"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onRerun?.(record);
              }}
            >
              Re-run
            </Button>
          )}
        {record.id && showCollapse && (
          <Button
            size="xs"
            variant="subtle"
            onClick={(e) => {
              e.stopPropagation();
              handleExpandToggle();
            }}
            className="flex items-center gap-1"
          >
            {isExpanded ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

const MessageLabel: React.FC<MessageLabelProps> = ({
  record,
  onRerun,
  onCancel,
  showCollapse = true,
}) => {
  const { runtimeConfig: config } = useAppStore();
  const { mutate, isLoading: isRerunning } = useCustomMutation();
  const { params } = useParsed();
  const { data: identity } = useGetIdentity<IIdentity>();
  const isMobile = useIsMobile();
  const { expandedRecordIds, setExpandedRecordIds } = useAppStore();

  const isExpanded =
    String(record.id) && expandedRecordIds.includes(String(record.id));

  const {
    views,
    activeProfile,
    activeApplication,
    activeSession,
    activeView,
    setViews,
  } = useAppStore();

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
      task_id: record?.task_id,
      profile_id: params?.profile_id || activeProfile?.id || identity?.email,
      view_id: params?.view_id || activeView?.id,
      session_id: params?.id || activeSession?.id,
      application_id: params?.application_id || activeApplication?.id,
    },
  };

  let run_task_state = {
    ...baseData,
    task: {
      id: record?.task_id,
      name: record?.task_id,
    },
  };

  const handleRerun = useCallback(() => {
    if (record.variables) {
      mutate({
        url: `${config?.API_URL}/re-run`,
        method: "post",
        values: run_task_state,
      });

      if (onRerun) {
        onRerun(record);
      }
    }
  }, [record, mutate, config?.API_URL, onRerun]);

  const getFirstValid = (...options: (string | undefined)[]): string => {
    return (
      options.find((opt) => typeof opt === "string" && opt.trim().length > 0) ||
      ""
    );
  };

  const formatDateTime = (
    dateValue: string | Date | null | undefined
  ): string => {
    if (!dateValue) return "";

    try {
      const date =
        typeof dateValue === "string" ? parseISO(dateValue) : dateValue;

      if (!isValid(date)) return "";

      if (isToday(date)) {
        return format(date, "h:mm a");
      }

      if (isYesterday(date)) {
        return `Yesterday ${format(date, "h:mm a")}`;
      }

      const yearDiff = differenceInYears(new Date(), date);
      if (yearDiff === 0) {
        return format(date, "MMM d, h:mm a");
      }

      return format(date, "MMM d, yyyy, h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const timestamp = record.updated_datetime || record.created_datetime;
  const formattedTime = formatDateTime(timestamp);

  const heading = getFirstValid(
    record.title,
    record.name,
    record.excerpt?.slice(0, 40),
    record.description?.slice(0, 40)
  );

  const subheading = getFirstValid(
    record.excerpt,
    record.description?.slice(0, 40)
  );

  const filteredVariables = record.variables
    ? extractKeys(
        record.variables,
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

  const formatVariables = (variables: Record<string, any>): string => {
    return Object.entries(variables)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };

  return (
    <Tooltip
      multiline
      position="bottom-start"
      classNames={{
        tooltip: "max-w-lg",
      }}
      label={
        <div className="space-y-2 text-white">
          <div className="font-medium">{heading}</div>
          {subheading && (
            <div className="text-sm text-gray-200">{subheading}</div>
          )}
          {Object.keys(filteredVariables).length > 0 && (
            <div className="text-sm text-gray-100 whitespace-pre-wrap font-mono">
              {formatVariables(filteredVariables)}
            </div>
          )}
        </div>
      }
    >
      <div className="w-full flex flex-col py-2 px-3 gap-2 cursor-pointer hover:bg-gray-50">
        {/* Author and Timestamp Row */}
        <div className="flex justify-between items-center">
          <Text size="sm" className="text-gray-600 font-medium">
            {record.author_id || ""}
          </Text>
          <Text size="sm" className="text-gray-500">
            {formattedTime}
          </Text>
        </div>

        {/* Heading Row */}
        <Text
          size="sm"
          className="font-medium text-gray-900 break-words whitespace-pre-wrap w-full"
        >
          {heading}
        </Text>

        {/* Subheading Row */}
        {subheading && (
          <Text
            size="sm"
            className="text-gray-600 break-words whitespace-pre-wrap w-full"
          >
            {subheading}
          </Text>
        )}

        {/* Action Status Row */}
        {record.action_status && (
          <div className="w-full">
            <ActionStatusInfo
              record={record}
              onRerun={handleRerun}
              onCancel={onCancel}
              isRerunning={isRerunning}
              showCollapse={showCollapse}
            />
          </div>
        )}

        {/* Variables Row */}
        {Object.keys(filteredVariables).length > 0 && (
          <div className="whitespace-pre-wrap font-mono text-xs text-gray-500 overflow-x-auto">
            {formatVariables(filteredVariables)}
          </div>
        )}
      </div>
    </Tooltip>
  );
};

export default MessageLabel;
