import { selectExecutionStatus } from "@components/Utils";
import { IFieldConfigurationWithValue } from "@components/interfaces";
import React from "react";

const ExecutionStatus: React.FC<IFieldConfigurationWithValue> = ({ value }) => {
  // const { setActiveItem_2, activeViewItem } = useAppStore();
  // const go = useGo();
  // Check if the value is a valid URL. If not, return an empty fragment
  if (!value) {
    return <></>;
  }

  return <div>{selectExecutionStatus(value)}</div>;
};

export default ExecutionStatus;
