import { Group, HoverCard, Popover, Text } from "@mantine/core";
import { ReactNode } from "react";

interface RevealProps {
  target: ReactNode;
  children: ReactNode;
  trigger: "hover" | "click";
}

function Reveal({ target, children, trigger }: RevealProps) {
  const TriggerComponent = trigger === "hover" ? HoverCard : Popover;

  return (
    <div>
      <TriggerComponent
        classNames={{
          dropdown:
            "w-full max-w-full sm:min-w-[300px] sm:max-w-[400px] md:min-w-[400px] md:max-w-[500px] lg:min-w-[500px] lg:max-w-[600px]",
        }}
        shadow="md"
        withinPortal={true}
      >
        <TriggerComponent.Target>{target}</TriggerComponent.Target>
        <TriggerComponent.Dropdown>{children}</TriggerComponent.Dropdown>
      </TriggerComponent>
    </div>
  );
}

export default Reveal;
