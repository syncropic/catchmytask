import React from "react";
import { ActionIcon, Button, Checkbox, Tooltip } from "@mantine/core";
import { useAppStore } from "src/store";
import {
  IconCrop54,
  IconListSearch,
  IconSearch,
  IconStackBack,
} from "@tabler/icons-react";
import { IconLetterB } from "@tabler/icons-react";
import FilterComponent from "@components/Filter";

interface QuickActionsBarProps {
  name?: string;
  heading?: string;
  subheading?: string;
  description?: string;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  name,
  heading,
  subheading,
  description,
}) => {
  const { sessionConfig, setSessionConfig, activeLayout, setActiveLayout } =
    useAppStore();

  // handle toggleDisplay
  const toggleDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      // console.log("newLayout", newLayout);
      newLayout[section].isDisplayed = !newLayout[section]?.isDisplayed;
      setActiveLayout(newLayout);
    }
  };

  const toggleSessionInteractionMode = (mode: string) => {
    if (sessionConfig) {
      const newSessionConfig = { ...sessionConfig };
      let currentInteractionMode = newSessionConfig["interaction_mode"];
      if (mode) {
        newSessionConfig["interaction_mode"] =
          currentInteractionMode === mode ? "interactive" : mode;
      }
      setSessionConfig(newSessionConfig);
    }
  };

  return (
    <div className="flex w-full items-center pl-4 pr-4 space-x-4">
      <div className="flex items-center space-x-2">
        <div>
          <Tooltip label="Toggle background mode" position="top">
            <ActionIcon
              aria-label="Toggle background mode"
              size="sm"
              onClick={() => toggleSessionInteractionMode("background")}
              variant={
                sessionConfig.interaction_mode == "background"
                  ? "filled"
                  : "outline"
              }
            >
              <IconLetterB />
            </ActionIcon>
          </Tooltip>
        </div>

        <div>
          <Tooltip label="Toggle state view" position="top">
            <ActionIcon
              aria-label="Toggle state view"
              size="sm"
              onClick={() => toggleDisplay("mobileStateView")}
              variant={
                activeLayout?.mobileStateView?.isDisplayed
                  ? "filled"
                  : "outline"
              }
            >
              <IconListSearch />
            </ActionIcon>
          </Tooltip>
        </div>
        <div>
          <Tooltip label="Toggle custom components" position="top">
            <ActionIcon
              aria-label="Toggle custom components"
              size="sm"
              onClick={() => toggleDisplay("mobileCustomComponents")}
              variant={
                activeLayout?.mobileCustomComponents?.isDisplayed
                  ? "filled"
                  : "outline"
              }
            >
              <IconCrop54 />
            </ActionIcon>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsBar;
