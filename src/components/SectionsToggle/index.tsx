import React from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useAppStore } from "src/store";
import { iconMap } from "@components/Utils";

type ColorSchemeProps = {};

export const SectionsToggle: React.FC<ColorSchemeProps> = ({}) => {
  const { setPinnedActionSteps, activeSections } = useAppStore();

  const toggleActiveSection = (stepName: string) => {
    // Dynamically toggle the is_displayed state for the given action step
    let newActiveSections = { ...activeSections };
    newActiveSections[stepName].isDisplayed =
      !newActiveSections[stepName].isDisplayed;

    // Update global state
    // openDisplay("rightSection");
    setPinnedActionSteps(newActiveSections);
  };

  // const openDisplay = (section: string) => {
  //   if (activeLayout) {
  //     const newLayout = { ...activeLayout };
  //     newLayout[section].isDisplayed = true;
  //     setActiveLayout(newLayout);
  //   }
  // };

  const action_steps = [
    { name: "summary" },
    // { name: "activity" },
    // { name: "issues" },
  ];

  return (
    <div className="flex space-x-2">
      {action_steps.map((step) => {
        const IconComponent = iconMap[step.name]; // Get the corresponding icon from iconMap
        return (
          <Tooltip key={step.name} label={`show ${step.name}`} position="top">
            <ActionIcon
              size="sm"
              variant={
                activeSections[step.name]?.isDisplayed ? "filled" : "outline"
              }
              onClick={() => toggleActiveSection(step.name)}
            >
              <IconComponent size={20} />
            </ActionIcon>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default SectionsToggle;
