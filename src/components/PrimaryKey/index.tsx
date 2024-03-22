import React from "react";
import { Anchor, Text } from "@mantine/core";
import { useAppStore } from "src/store";
import { useGo } from "@refinedev/core";
import { IFieldConfigurationWithValue } from "@components/interfaces";

const PrimaryKey: React.FC<IFieldConfigurationWithValue> = ({
  value,
  record,
  display_format,
  display_component,
  display_component_content,
}) => {
  const { setActiveItem_2, activeViewItem } = useAppStore();
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
              resource: "datasets",
              action: "show",
              id: value,
            },
            type: "push",
          });
        }}
      >
        {display_component_content ? display_component_content : value}
      </Text>
    </Anchor>
  );
};

export default PrimaryKey;
