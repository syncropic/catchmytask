import React from "react";
import {
  format,
  isValid,
  parseISO,
  isToday,
  isYesterday,
  differenceInYears,
} from "date-fns";
import { Tooltip, Text, Box, LoadingOverlay } from "@mantine/core";
import {
  IconCircle,
  IconClock,
  IconCircleX,
  IconCircleCheck,
  IconQuestionMark,
} from "@tabler/icons-react";

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
  action_status?: ActionStatus;
  variables?: Record<string, any>;
}

interface MessageLabelProps {
  record: MessageLabelRecord;
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

const ActionStatusInfo: React.FC<{ record: MessageLabelRecord }> = ({
  record,
}) => {
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
                  loaderProps={{
                    color: "blue",
                    size: "xs",
                    type: "dots",
                  }}
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

  return <div className="flex flex-col space-y-1">{renderContent()}</div>;
};

const MessageLabel: React.FC<MessageLabelProps> = ({ record }) => {
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

  const truncateText = (text: string | undefined, length: number): string => {
    if (!text) return "";
    return text.length > length ? `${text.slice(0, length)}...` : text;
  };

  // Filter out specific keys from variables
  const filteredVariables = record.variables
    ? extractKeys(
        record.variables,
        [
          "application_id",
          "profile_id",
          "session_id",
          "task_id",
          "execution_mode",
          "breakpoint",
          "summary_message_code",
          "task_name",
        ],
        "exclude"
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
      <div className="w-full flex flex-col py-2 px-3 gap-1 cursor-pointer hover:bg-gray-50">
        {/* Row 1: Author and Date */}
        <div className="flex items-center justify-between gap-4 min-w-0">
          <Text size="sm" className="text-gray-600 font-medium truncate flex-1">
            {record.author_id || ""}
          </Text>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <Text size="sm" className="text-gray-500 whitespace-nowrap">
              {formattedTime}
            </Text>
            {record.action_status && <ActionStatusInfo record={record} />}
          </div>
        </div>

        {/* Row 2: Heading */}
        <Text
          size="sm"
          className="font-medium text-gray-900 truncate w-full"
          lineClamp={1}
        >
          {truncateText(heading, 40)}
        </Text>

        {/* Row 3: Subheading */}
        {subheading && (
          <Text
            size="sm"
            className="text-gray-600 truncate w-full"
            lineClamp={1}
          >
            {truncateText(subheading, 40)}
          </Text>
        )}

        {/* Row 4: Variables */}
        {Object.keys(filteredVariables).length > 0 && (
          <div className="whitespace-pre-wrap font-mono text-xs text-gray-500 mt-0.5">
            {formatVariables(filteredVariables)}
          </div>
        )}
      </div>
    </Tooltip>
  );
};

export default MessageLabel;
