import React from "react";
import { ActionIcon, Button, Tooltip, Text } from "@mantine/core";
import { IconSettingsAutomation } from "@tabler/icons-react";
import { useAppStore } from "src/store";
import Reveal from "@components/Reveal";
import MonacoEditor from "@components/MonacoEditor";

export const AutomationsToggle: React.FC = () => {
  // Assume live_generate can have any keys, use Record<string, any>
  const { live_generate } = useAppStore() as {
    live_generate: Record<string, any>;
  };

  // Check if any of the live_generate items have is_live_generating set to true
  const hasActiveAutomation = Object.values(live_generate).some(
    (item) => item?.is_live_generating === true
  );

  // Get the count of live_generating items that are true
  const activeAutomationCount = Object.values(live_generate).filter(
    (item) => item?.is_live_generating === true
  ).length;

  return (
    <Reveal
      trigger="click"
      target={
        <div className="flex items-center ">
          <div>
            <Tooltip label="Active automations" position="top">
              <Button.Group>
                {hasActiveAutomation && (
                  <Button size="compact-sm" variant="outline">
                    {activeAutomationCount}
                  </Button>
                )}
                <Button size="compact-sm">
                  <ActionIcon size="sm">
                    <IconSettingsAutomation size={20} />
                  </ActionIcon>
                </Button>

                {/* Render the loading button only if at least one automation is active */}
                {hasActiveAutomation && (
                  <Button size="compact-sm" loading={true} variant="outline" />
                )}
              </Button.Group>
            </Tooltip>
            {/* Display count of active processes if any are running */}
            {/* {activeAutomationCount > 0 && (
              <Text size="xs" color="blue" ml="sm">
                {activeAutomationCount} running
              </Text>
            )} */}
          </div>
        </div>
      }
    >
      <MonacoEditor
        value={JSON.stringify(live_generate, null, 2)}
        language="json"
        height="50vh"
      />
    </Reveal>
  );
};

export default AutomationsToggle;
