import React from "react";
import { Anchor, Text } from "@mantine/core";
import { useAppStore } from "src/store";
import { useGo } from "@refinedev/core";

const SessionLink = ({ value, record, displayComponentContent }) => {
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
        {displayComponentContent ? displayComponentContent : value}
      </Text>
    </Anchor>
  );
};

export default SessionLink;
