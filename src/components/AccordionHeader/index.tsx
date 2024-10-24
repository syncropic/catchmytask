import ComponentsToolbar from "@components/ComponentsToolbar";
import MonacoEditor from "@components/MonacoEditor";
import Reveal from "@components/Reveal";
import ExternalSubmitButton from "@components/SubmitButton";
import { useUpdateComponentAction } from "@components/Utils";
import { Text } from "@mantine/core";
import { useAppStore } from "src/store";

interface AccordionHeaderProps {
  name?: string; // Adjust the type as needed
  entity_type?: string;
}

const AccordionHeader: React.FC<AccordionHeaderProps> = ({ name, entity_type }) => {
  const { activeTask, selectedRecords, focused_entities } = useAppStore();
  let action = focused_entities[activeTask?.id]?.["action"];
  const { updateComponentAction } = useUpdateComponentAction();

  return (
    <div className="flex justify-between items-center">
      <div>{name}</div>

      {/* <div className="p-3" onClick={(e) => e.stopPropagation()}>
        {activeTask && (
          <div className="flex items-center gap-2">
            {selectedRecords["issues"]?.length > 0 && (
              <div onClick={(e) => e.stopPropagation()}>
                <Reveal
                  trigger="click"
                  target={
                    <Text c="blue" size="xs">
                      {`${selectedRecords["issues"]?.length} selected`}
                    </Text>
                  }
                >
                  <MonacoEditor
                    value={JSON.stringify(selectedRecords["issues"], null, 2)}
                    language="json"
                    height="50vh"
                  />
                </Reveal>
              </div>
            )}

            {action && (
              <ExternalSubmitButton
                record={activeTask}
                entity_type="tasks"
                action={action}
              />
            )}
          </div>
        )}
      </div> */}

      <div className="pr-3">
        <ComponentsToolbar
          include_components={[
            // {
            //   action: "search",
            //   entity_type: "action_steps",
            //   type: "action",
            //   record: activeTask,
            //   onClick: updateComponentAction,
            // },
            {
              action: "save",
              entity_type: entity_type || "action_steps",
              type: "action",
              record: activeTask,
              onClick: updateComponentAction,
            },
            {
              action: "upload",
              entity_type: entity_type || "action_steps",
              type: "action",
              record: activeTask,
              onClick: updateComponentAction,
            },
            // {
            //   action: "execute",
            //   entity_type: "action_steps",
            //   type: "action",
            //   record: activeTask,
            //   onClick: updateComponentAction,
            // },
          ]}
        />
      </div>
    </div>
  );
};

export default AccordionHeader;
