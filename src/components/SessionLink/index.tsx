import React from "react";
import { Anchor, Text } from "@mantine/core";
import { useAppStore } from "src/store";
import { useGo } from "@refinedev/core";
import { IFieldConfigurationWithValue } from "@components/interfaces";

const SessionLink: React.FC<IFieldConfigurationWithValue> = ({
  value,
  record,
  display_format,
  display_component,
  display_component_content,
}) => {
  const { activeApplication, setActiveSession } = useAppStore();
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
          // setActiveItem_2(record);
          setActiveSession(record);
          go({
            to: {
              resource: "sessions",
              action: "show",
              id: record.id,
              meta: {
                applicationId: activeApplication?.id,
              },
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

export default SessionLink;
