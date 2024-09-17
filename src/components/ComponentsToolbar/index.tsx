import React from "react";
import { ActionIcon, Indicator, Tooltip, Menu } from "@mantine/core";
import {
  IconCircleMinus,
  IconCircleX,
  IconFileDownload,
  IconMenu2,
  IconPin,
  IconPlayerPlay,
  IconPlayerStop,
  IconSettingsAutomation,
  IconShare,
  IconTool,
  IconZoomCode,
  IconCopy,
  IconTrash,
  IconForms,
  IconPlaylistAdd,
} from "@tabler/icons-react";
import { useAppStore } from "src/store";

interface ComponentsToolbarProps {
  include_components: {
    action: string;
    record: any;
    entity_type: string;
    type: string;
    onClick: (
      event: React.MouseEvent,
      record: any,
      entity_type: string,
      action: string,
      type: string
    ) => void;
  }[];
}

const ComponentsToolbar: React.FC<ComponentsToolbarProps> = ({
  include_components = [],
}) => {
  const { focused_entities, setFocusedEntities } = useAppStore();
  const handleMenuClick = (action: string, record: any) => {
    // console.log("Menu action:", action);
    // focused_entities["action_input"].action = action;
    const new_focused_entities = { ...focused_entities };
    //   console.log("new_focused_entities", new_focused_entities);
    //   console.log("id", id);
    if (!new_focused_entities["action_input"]) {
      new_focused_entities["action_input"] = {};
    } else {
      new_focused_entities["action_input"].action = action;
      new_focused_entities["action_input"].record = record;
    }
    setFocusedEntities(new_focused_entities);
  };

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
    implement: IconPlaylistAdd,
  };

  return (
    <div className="flex gap-1">
      {include_components?.map((component, index) => {
        // Get the appropriate icon component
        const IconComponent = iconMap[component?.action];

        if (component?.action === "menu") {
          return (
            <Menu key={index} withinPortal>
              <Menu.Target>
                <ActionIcon
                  aria-label={component?.action}
                  size="xs"
                  // onClick={(e) =>
                  //   component?.onClick(
                  //     e,
                  //     component?.record,
                  //     component?.entity_type,
                  //     component?.action,
                  //     component?.type
                  //   )
                  // }
                >
                  <IconMenu2 size={16} /> {/* Render the menu icon */}
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconForms size={14} />}
                  onClick={() =>
                    handleMenuClick("toggle_form", component?.record)
                  }
                >
                  Toggle Form
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCopy size={14} />}
                  onClick={() => handleMenuClick("clone", component?.record)}
                >
                  Clone
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconTrash size={14} color="red" />}
                  onClick={() => handleMenuClick("delete", component?.record)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          );
        }

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
                  component?.type
                )
              }
              {...{
                variant:
                  focused_entities[component?.record?.id]?.[component?.type] ===
                  component?.action
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
          <Indicator inline label="on" size={16} color="blue" key={index}>
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
