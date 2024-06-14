// ResourceHeader.tsx
import React from "react";
import { Title, Text, ActionIcon, Button, Tooltip } from "@mantine/core";
import { IconFunction } from "@tabler/icons-react";
import { useAppStore } from "src/store";
import { useMouse } from "@mantine/hooks";
import { set } from "lodash";

interface ActivateActionsSelectionProps {
  record: any;
  resultsSection: any;
}

const ActivateActionsSelection: React.FC<ActivateActionsSelectionProps> = ({
  record,
  resultsSection,
}) => {
  const {
    isActionsSelectionOpen,
    setIsActionsSelectionOpen,
    setActiveMouseCoordinates,
    setActiveResultsSection,
    setActiveRecord,
  } = useAppStore();
  const { ref, x, y } = useMouse();

  const handleRecordSelection = (record: any) => {
    // console.log("record", record);
    setIsActionsSelectionOpen(true);
    setActiveMouseCoordinates({ x, y });
    setActiveRecord(record);
    setActiveResultsSection(resultsSection);
  };

  return (
    <>
      <Tooltip label="select action">
        <ActionIcon
          aria-label="Settings"
          onClick={() => handleRecordSelection(record)}
        >
          <IconFunction size={16} />
        </ActionIcon>
      </Tooltip>
    </>
  );
};

export default ActivateActionsSelection;
