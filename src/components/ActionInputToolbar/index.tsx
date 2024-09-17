import React from "react";
import { ActionIcon, Indicator, Tooltip } from "@mantine/core";
import {
  IconCircleMinus,
  IconCircleX,
  IconEraser,
  IconFileDownload,
  IconMenu2,
  IconPin,
  IconPlayerPlay,
  IconPlayerStop,
  IconSettingsAutomation,
  IconShare,
  IconTool,
  IconZoomCode,
} from "@tabler/icons-react";
import { useAppStore } from "src/store";

interface ActionInputToolbarProps {
  include_components: {
    action: string;
    record: any;
    entity_type: string;
    type: string;
    tool: string;
    onClick: (
      event: React.MouseEvent,
      record: any,
      entity_type: string,
      action: string,
      type: string,
      tool: string
    ) => void;
  }[];
}

const ActionInputToolbar: React.FC<ActionInputToolbarProps> = ({
  include_components = [],
}) => {
  const { entity_types, focused_entities } = useAppStore();

  // Icon mapping object
  const iconMap: Record<string, React.ElementType> = {
    pin: IconPin,
    remove: IconCircleMinus,
    configure: IconTool,
    automate: IconSettingsAutomation,
    save: IconFileDownload,
    execute: IconPlayerPlay,
    query: IconZoomCode,
    share: IconShare,
    cancel: IconCircleX,
    display: IconPlayerStop,
    menu: IconMenu2,
    clear: IconEraser,
    reset: IconCircleMinus,
  };

  return (
    <div className="flex gap-1">
      {include_components?.map((component, index) => {
        // Get the appropriate icon component
        const IconComponent = iconMap[component?.action];

        const ActionContent = (
          <Tooltip
            label={`${component?.action} ${component?.entity_type}`}
            position="top"
            key={index}
          >
            <ActionIcon
              aria-label={component?.action}
              size="xs"
              onClick={(e) =>
                component?.onClick(
                  e,
                  component?.record,
                  component?.entity_type,
                  component?.action,
                  component?.type,
                  component?.tool
                )
              }
              {...{
                variant:
                  focused_entities["action_input"]?.["tool"] === component?.tool
                    ? "filled"
                    : "outline",
              }}
            >
              {IconComponent && <IconComponent size={16} />}{" "}
              {/* Render the icon */}
            </ActionIcon>
          </Tooltip>
        );

        return component?.action === "automate" ? (
          <Indicator inline label="on" size={16} color="blue">
            {ActionContent}
          </Indicator>
        ) : (
          ActionContent
        );
      })}
    </div>
  );
};

export default ActionInputToolbar;
