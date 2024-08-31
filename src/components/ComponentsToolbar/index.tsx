import React from "react";
import { ActionIcon, Indicator, Tooltip } from "@mantine/core";
import {
  IconCircleMinus,
  IconPin,
  IconSettingsAutomation,
  IconTool,
} from "@tabler/icons-react";
import { useAppStore } from "src/store";

interface ComponentsToolbarProps {
  include_components: {
    action: string;
    entity_type: string;
    onClick: (event: React.MouseEvent, entity_type: string) => void;
  }[];
}

const ComponentsToolbar: React.FC<ComponentsToolbarProps> = ({
  include_components = [],
}) => {
  const { activeSections } = useAppStore();

  // Icon mapping object
  const iconMap: Record<string, React.ElementType> = {
    pin: IconPin,
    remove: IconCircleMinus,
    configure: IconTool,
    automate: IconSettingsAutomation,
  };

  return (
    <div className="flex gap-1">
      {include_components?.map((component) => {
        // Get the appropriate icon component
        const IconComponent = iconMap[component?.action];

        const ActionContent = (
          <Tooltip
            key={component?.entity_type}
            label={`${component?.action} ${component?.entity_type} component`}
            position="top"
          >
            <ActionIcon
              aria-label={component?.action}
              size="xs"
              onClick={(e) => component?.onClick(e, component?.entity_type)}
              variant="outline"
              {...(component?.action === "pin" && {
                variant: activeSections[component?.entity_type]?.isPinned
                  ? "filled"
                  : "outline",
              })}
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

export default ComponentsToolbar;
