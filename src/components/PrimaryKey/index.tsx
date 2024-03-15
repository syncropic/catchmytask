import React from "react";
import { Anchor, Text } from "@mantine/core";
import { useAppStore } from "src/store";
import { useGo } from "@refinedev/core";

const PrimaryKey = ({ value, record, displayComponentContent }) => {
  const { setActiveItem_2 } = useAppStore();
  const go = useGo();
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
          go({
            to: {
              resource: "applications",
              action: "show",
              id: value,
            },
            // to: "/applications/show/applications:⟨018e21b1-0bfe-7048-ab46-2b39f5f8091c⟩",
            type: "push",
          });
        }}
      >
        {displayComponentContent ? displayComponentContent : value}
      </Text>
    </Anchor>
  );
};

export default PrimaryKey;
