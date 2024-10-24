// AccordionComponent.ts
// This component dynamically generates accordion sections based on the provided layout configuration.

import React from "react";
import { Accordion } from "@mantine/core";
import { AccordionSection } from "@components/interfaces";
import { useAppStore } from "src/store";
import { iconMap } from "@components/Utils";

interface AccordionComponentProps {
  sections: AccordionSection[]; // The sections to render in the accordion
  [key: string]: any; // Additional props of any type
}

const AccordionComponent: React.FC<AccordionComponentProps> = ({
  sections,
  defaultExpandedValues,
  ...restProps
}) => {
  const { activeTask, activeSession } = useAppStore();
  return (
    <Accordion multiple defaultValue={defaultExpandedValues || []}>
      {sections.map(
        (section) =>
          section.isVisible !== false && ( // Only render if the section is visible
            <Accordion.Item value={section?.key || restProps?.action} key={section?.key || restProps?.action}>
              <Accordion.Control icon={iconMap[section?.icon || restProps?.action || section?.key] ? React.createElement(iconMap[section?.icon || restProps?.action || section?.key], { size: 16 }) : null}>
                {/* Check if title is a string, otherwise render as a React component */}
                {/* {section?.key} */}
                {typeof section?.title || restProps?.action === "string"
                  ? section?.title || restProps?.action
                  : React.isValidElement(section?.title || restProps?.action)
                  ? section?.title || restProps?.action
                  : typeof section?.title || restProps?.action === "function"
                  ? React.createElement(section?.title || restProps?.action)
                  : null}
              </Accordion.Control>
              <Accordion.Panel>
                <section.Component
                  activeTask={activeTask}
                  activeSession={activeSession}
                  {...restProps} // Spread any additional props
                />
              </Accordion.Panel>
            </Accordion.Item>
          )
      )}
    </Accordion>
  );
};

export default AccordionComponent;
