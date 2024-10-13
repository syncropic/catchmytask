// AccordionComponent.ts
// This component dynamically generates accordion sections based on the provided layout configuration.

import React from "react";
import { Accordion } from "@mantine/core";
import { AccordionSection } from "@components/interfaces";

interface AccordionComponentProps {
  sections: AccordionSection[]; // The sections to render in the accordion
  activeTask: any;
  activeSession: any;
}

const AccordionComponent: React.FC<AccordionComponentProps> = ({
  sections,
  activeTask,
  activeSession,
}) => {
  return (
    <Accordion multiple>
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
                  : React.createElement(section.title)}
              </Accordion.Control>
              <Accordion.Panel>
                <section.Component
                  activeTask={activeTask}
                  activeSession={activeSession}
                />
              </Accordion.Panel>
            </Accordion.Item>
          )
      )}
    </Accordion>
  );
};

export default AccordionComponent;
