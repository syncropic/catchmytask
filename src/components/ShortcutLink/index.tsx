import React from "react";
import { Anchor, Group, HoverCard, Text } from "@mantine/core";
import { useAppStore } from "src/store";
import { useGo } from "@refinedev/core";
import { IFieldConfigurationWithValue } from "@components/interfaces";

const ShortcutLink: React.FC<IFieldConfigurationWithValue> = ({
  value,
  record,
  display_format,
  display_component,
  display_component_content,
}) => {
  const { activeApplication, setActiveSession, setActionType } = useAppStore();
  const go = useGo();
  // Check if the value is a valid URL. If not, return an empty fragment
  if (!value) {
    return <></>;
  }

  return (
    <Group>
      <HoverCard width={280} shadow="md" withinPortal={true} openDelay={1000}>
        <HoverCard.Target>
          <Anchor>
            <Text
              size="sm"
              onClick={() => {
                // setActiveItem_2(record);
                setActiveSession(record);
                go({
                  to: {
                    resource: "sessions",
                    action: "show",
                    id: record.record_id,
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
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Anchor>
            <Text
              size="sm"
              // onClick={() => {
              //   setActionType("remove_from_shortcuts");
              //   mutateDelete(
              //     {
              //       resource: "shortcuts",
              //       id: row.original.id,
              //     },
              //     {
              //       onError: (error, variables, context) => {
              //         // An error occurred!
              //         console.log("error", error);
              //       },
              //       onSuccess: (data, variables, context) => {
              //         // Let's celebrate!
              //         // invalidate({
              //         //   resource: "shortcuts",
              //         //   invalidates: ["list"],
              //         // });
              //       },
              //     }
              //   );
              // }}
            >
              (-) Remove from shortcuts
            </Text>
          </Anchor>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
};

export default ShortcutLink;
