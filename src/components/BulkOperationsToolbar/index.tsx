import React from "react";
import { ActionIcon, Indicator, Tooltip, Menu, Button } from "@mantine/core";
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
  IconTallymark3,
  IconPencil,
  IconSitemap,
  IconCode,
  IconSearch,
  IconLayoutSidebarLeftCollapseFilled,
  IconLayoutSidebarRightCollapseFilled,
  IconLayoutDistributeVertical,
  IconCopyCheck,
  IconUserPlus,
  IconEye,
} from "@tabler/icons-react";

import { useAppStore } from "src/store";
import Reveal from "@components/Reveal";
import ActionInputWrapper from "@components/ActionInput";
import SearchInput from "@components/SearchInput";
import { iconMap } from "@components/Utils";

interface BulkOperationsToolbarProps {
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

const BulkOperationsToolbar: React.FC<BulkOperationsToolbarProps> = ({
  include_components = [],
}) => {
  const { focused_entities, setFocusedEntities, fields } = useAppStore();
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

  return (
    <div className="flex gap-1 items-center">
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
                  leftSection={
                    <IconLayoutSidebarRightCollapseFilled size={14} />
                  }
                  onClick={() =>
                    handleMenuClick("pin to right sidebar", component?.record)
                  }
                >
                  pin to right sidebar
                </Menu.Item>
                {/* <Menu.Item
                  leftSection={
                    <IconLayoutSidebarLeftCollapseFilled size={14} />
                  }
                  onClick={() =>
                    handleMenuClick("pin to left sidebar", component?.record)
                  }
                >
                  pin to left sidebar
                </Menu.Item> */}
                {/* <Menu.Item
                  leftSection={<IconForms size={14} />}
                  onClick={() =>
                    handleMenuClick("toggle_form", component?.record)
                  }
                >
                  Toggle Form
                </Menu.Item> */}
                {/* <Menu.Item
                  leftSection={<IconCopy size={14} />}
                  onClick={() => handleMenuClick("clone", component?.record)}
                >
                  Clone
                </Menu.Item> */}
                {/* <Menu.Item
                  leftSection={<IconTrash size={14} color="red" />}
                  onClick={() => handleMenuClick("delete", component?.record)}
                >
                  Delete
                </Menu.Item> */}
              </Menu.Dropdown>
            </Menu>
          );
        }

        if (component?.action === "custom_actions") {
          return (
            <div className="flex max-w-xs">
              <SearchInput
                include_action_icons={[]}
                size="xs"
                placeholder="select custom action"
                activeFilters={[
                  {
                    description: "actions",
                    entity_type: "actions",
                    id: 1,
                    is_selected: true,
                    name: "actions",
                  },
                ]}
              />
            </div>
          );
        }

        if (component?.action === "fields") {
          return (
            <Reveal
              target={
                // <Indicator inline label={activeFiltersCount} size={16} color="blue">
                //   <Tooltip label="Filter" position="right">
                //     <ActionIcon aria-label="filter" size="sm">
                //       <IconFilter />
                //     </ActionIcon>
                //   </Tooltip>
                // </Indicator>
                <Tooltip label="Fields" position="right">
                  <ActionIcon aria-label="filter" size="xs" variant="outline">
                    <IconTallymark3 />
                  </ActionIcon>
                </Tooltip>
              }
              trigger="click"
            >
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {searchFilters.map((item: FilterItem) => (
              <Checkbox
                checked={item.is_selected}
                label={item.description}
                key={item.id}
                onChange={() => handleCheckboxChange(item.id)}
              />
            ))}
          </div> */}
              {/* <div>action step fields control</div> */}
              {/* <div>{JSON.stringify(fields?.[component?.record?.id])}</div> */}
              {true ? (
                <div className="w-full">
                  <ActionInputWrapper
                    name="fields"
                    query_name="data_model"
                    record={{
                      fields: fields?.[component?.record?.id],
                      id: component?.record?.id,
                    }}
                    // action={
                    //   focused_entities[activeTask?.id]?.action ||
                    //   action
                    // }
                    action="set_fields"
                    success_message_code="action_input_data_model_schema"
                    read_record_mode="local"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center p-4">
                  <p className="text-sm text-gray-600 text-center">
                    data fields will appear here.
                  </p>
                </div>
              )}
            </Reveal>
          );
        }

        const ActionContent = (
          <Tooltip
            label={`${component?.action} ${component?.entity_type}`}
            position="top"
            key={index}
          >
            <Button
              aria-label={component?.action}
              size="compact-xs"
              onClick={(e) =>
                component?.onClick(
                  e,
                  component?.record,
                  component?.entity_type,
                  component?.action,
                  component?.type
                )
              }
              // {...{
              //   variant:
              //     focused_entities[component?.record?.id]?.[component?.type] ===
              //     component?.action
              //       ? "filled"
              //       : "outline",
              // }}
              leftSection={IconComponent && <IconComponent size={16} />}
            >
              {/* {IconComponent && <IconComponent size={16} />}{" "} */}
              {/* Render the icon */}
              {component?.action}
            </Button>
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

export default BulkOperationsToolbar;
