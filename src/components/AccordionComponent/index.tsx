// AccordionComponent.ts
// This component dynamically generates accordion sections based on the provided layout configuration.

import React from "react";
import { Accordion } from "@mantine/core";
import { AccordionSection } from "@components/interfaces";
import { useAppStore } from "src/store";

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
            <Accordion.Item value={section.key} key={section.key}>
              <Accordion.Control icon={section.icon}>
                {/* Check if title is a string, otherwise render as a React component */}
                {typeof section.title === "string"
                  ? section.title
                  : React.isValidElement(section.title)
                  ? section.title
                  : typeof section.title === "function"
                  ? React.createElement(section.title)
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
