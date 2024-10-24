import React from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useAppStore } from "src/store";
import { iconMap } from "@components/Utils";

type ColorSchemeProps = {};

export const PinActionStepsToggle: React.FC<ColorSchemeProps> = ({}) => {
  const {
    pinned_action_steps,
    setPinnedActionSteps,
    activeLayout,
    setActiveLayout,
  } = useAppStore();

  const togglePinActionStep = (stepName: string) => {
    // Dynamically toggle the is_displayed state for the given action step
    let newPinnedActionSteps = { ...pinned_action_steps };
    newPinnedActionSteps[stepName].is_displayed =
      !newPinnedActionSteps[stepName].is_displayed;

    // Update global state
    openDisplay("rightSection");
    setPinnedActionSteps(newPinnedActionSteps);
  };

  const openDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = true;
      setActiveLayout(newLayout);
    }
  };

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
          <Tooltip
            key={step.name}
            label={`pin ${step.name} to right section`}
            position="top"
          >
            <ActionIcon
              size="sm"
              variant={
                pinned_action_steps[step.name]?.is_displayed
                  ? "filled"
                  : "outline"
              }
              onClick={() => togglePinActionStep(step.name)}
            >
              <IconComponent size={20} />
            </ActionIcon>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default PinActionStepsToggle;
