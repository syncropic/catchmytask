import { Group, HoverCard, Popover, Text } from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { ReactNode } from "react";

interface RevealProps {
  target: ReactNode;
  children: ReactNode;
  trigger: "hover" | "click";
}

function Reveal({ target, children, trigger }: RevealProps) {
  const TriggerComponent = trigger === "hover" ? HoverCard : Popover;
  const { width } = useViewportSize();

  // Use 992px as the breakpoint for large screens (Mantine's 'lg' breakpoint)
  const popoverWidth = width < 992 ? 350 : 500;

  return (
    <div>
      <TriggerComponent width={popoverWidth} shadow="md" withinPortal={true}>
        <TriggerComponent.Target>{target}</TriggerComponent.Target>
        <TriggerComponent.Dropdown>{children}</TriggerComponent.Dropdown>
      </TriggerComponent>
    </div>
  );
}

export default Reveal;
