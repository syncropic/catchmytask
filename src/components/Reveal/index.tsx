import { Group, HoverCard, Popover, Text } from "@mantine/core";

function Reveal({
  target,
  children,
  trigger,
}: {
  target: any;
  children: any;
  trigger: "hover" | "click";
}) {
  const TriggerComponent = trigger === "hover" ? HoverCard : Popover;

  return (
    <Group>
      <TriggerComponent width={600} shadow="md" withinPortal={true}>
        <TriggerComponent.Target>
          <Text>{target}</Text>
        </TriggerComponent.Target>
        <TriggerComponent.Dropdown>{children}</TriggerComponent.Dropdown>
      </TriggerComponent>
    </Group>
  );
}

export default Reveal;
