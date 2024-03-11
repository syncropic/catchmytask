import React from "react";
import { Anchor, Text } from "@mantine/core";
import { useAppStore } from "src/store";

const PrimaryKey = ({ value, record, displayComponentContent }) => {
  const { setActiveItem_2 } = useAppStore();
  // Check if the value is a valid URL. If not, return an empty fragment
  if (!value) {
    return <></>;
  }

  return (
    <Anchor component={Text}>
      <Text
        size="sm"
        onClick={() => {
          setActiveItem_2(record);
        }}
      >
        {displayComponentContent ? displayComponentContent : value}
      </Text>
    </Anchor>
  );
};

export default PrimaryKey;
