import React from "react";
import { Anchor, Text } from "@mantine/core";
import { useAppStore } from "src/store";
import { useGo } from "@refinedev/core";
import { selectExecutionStatus } from "@components/Utils";

const ExecutionStatus = ({ value }) => {
  // const { setActiveItem_2, activeViewItem } = useAppStore();
  // const go = useGo();
  // Check if the value is a valid URL. If not, return an empty fragment
  if (!value) {
    return <></>;
  }

  return <div>{selectExecutionStatus(value)}</div>;
};

export default ExecutionStatus;
