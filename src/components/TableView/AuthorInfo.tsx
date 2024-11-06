import React from "react";
import {
  IconRobot,
  IconUser,
  IconServer,
  TablerIconsProps,
} from "@tabler/icons-react";
import { Text, Group, Box, Tooltip, LoadingOverlay } from "@mantine/core";
import { format, isValid, parseISO } from "date-fns";

type AuthorType = "user" | "agent" | "system";

interface AuthorAvatarProps {
  authorType: AuthorType;
  size?: number;
}

interface DisplayConfig {
  showAvatar?: boolean;
  showAuthorId?: boolean;
  showTimestamp?: boolean;
  showLoadingIndicator?: boolean;
  showName?: boolean;
  showDescription?: boolean;
  showAutomationToggle?: boolean;
  layout?: "compact" | "stacked";
  indentContent?: boolean;
  avatarSize?: number;
}

interface AuthorInfoProps {
  record: any;
  onAction: (record: any) => void;
  AutomationToggle?: React.ComponentType<{
    record: any;
    onAction: (record: any) => void;
    query_key?: any;
  }>;
  formatDate: (date: string) => string;
  displayConfig?: DisplayConfig;
  className?: string;
  query_key?: string;
}

const authorTypeConfig: Record<
  AuthorType,
  {
    icon: (props: TablerIconsProps) => JSX.Element;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  user: {
    icon: IconUser,
    bgColor: "bg-blue-50",
    textColor: "text-blue-500",
    borderColor: "border-blue-200",
  },
  agent: {
    icon: IconRobot,
    bgColor: "bg-orange-50",
    textColor: "text-orange-500",
    borderColor: "border-orange-200",
  },
  system: {
    icon: IconServer,
    bgColor: "bg-purple-50",
    textColor: "text-purple-500",
    borderColor: "border-purple-200",
  },
};

const defaultDisplayConfig: DisplayConfig = {
  showAvatar: true,
  showAuthorId: true,
  showTimestamp: true,
  showLoadingIndicator: true,
  showName: true,
  showDescription: true,
  showAutomationToggle: true,
  layout: "stacked",
  indentContent: true,
  avatarSize: 16,
};

const AuthorAvatar: React.FC<AuthorAvatarProps> = ({
  authorType,
  size = 16,
}) => {
  const config =
    authorTypeConfig[authorType as AuthorType] || authorTypeConfig.user;
  const Icon = config.icon;

  return (
    <div
      className={`
        p-1.5 
        rounded-full 
        flex 
        items-center 
        justify-center
        border
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
      `}
    >
      <Icon size={size} stroke={1.5} />
    </div>
  );
};

const LoadingIndicator: React.FC = () => (
  <Tooltip label="running" position="top">
    <Box className="text-sm relative">
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
  </Tooltip>
);

const AuthorInfo: React.FC<AuthorInfoProps> = ({
  record,
  onAction,
  AutomationToggle,
  formatDate,
  displayConfig = {},
  className = "",
  query_key,
}) => {
  if (!record) return null;

  // Merge default config with provided config
  const config = { ...defaultDisplayConfig, ...displayConfig };
  const {
    showAvatar,
    showAuthorId,
    showTimestamp,
    showLoadingIndicator,
    showName,
    showDescription,
    showAutomationToggle,
    layout,
    indentContent,
    avatarSize,
  } = config;

  const indentClass = indentContent ? "pl-9" : "";
  const mainGroupClass = layout === "compact" ? "flex-row" : "flex-col gap-0";

  return (
    <Group align="flex-start" className={`flex ${mainGroupClass} ${className}`}>
      {/* First row - always present */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {showAvatar && (
            <AuthorAvatar authorType={record.author_type} size={avatarSize} />
          )}

          {showAutomationToggle && AutomationToggle && (
            <AutomationToggle
              record={record}
              onAction={onAction}
              query_key={query_key}
            />
          )}

          {showAuthorId && (
            <Text c="teal" className="text-sm">
              {record.author_id}
            </Text>
          )}

          {showTimestamp && (
            <>
              <Text c="dimmed" className="text-sm">
                {" "}
                •{" "}
              </Text>
              <Text size="xs" c="dimmed">
                {formatDate(record.updated_datetime)}
              </Text>
            </>
          )}

          {showLoadingIndicator && record?.status === "run" && (
            <LoadingIndicator />
          )}
        </div>
      </div>

      {/* Name row - optional */}
      {showName && record.name && (
        <div className={indentClass}>
          <Text size="sm" fw={500}>
            {record.name}
          </Text>
        </div>
      )}

      {/* Description row - optional */}
      {showDescription && record.name && (
        <div className={indentClass}>
          <Text size="xs" c="dimmed">
            {record.name}
          </Text>
        </div>
      )}
    </Group>
  );
};

// Preset configurations
export const authorInfoConfigs = {
  compact: {
    showAvatar: true,
    showAuthorId: true,
    showTimestamp: true,
    showLoadingIndicator: false,
    showName: false,
    showDescription: false,
    layout: "compact",
    indentContent: false,
  },
  full: {
    showAvatar: true,
    showAuthorId: true,
    showTimestamp: true,
    showLoadingIndicator: true,
    showName: true,
    showDescription: true,
    layout: "stacked",
    indentContent: true,
  },
  minimal: {
    showAvatar: true,
    showAuthorId: true,
    showTimestamp: false,
    showLoadingIndicator: false,
    showName: false,
    showDescription: false,
    layout: "compact",
    indentContent: false,
  },
} as const;

export type { AuthorType, AuthorInfoProps, DisplayConfig };
export default AuthorInfo;
