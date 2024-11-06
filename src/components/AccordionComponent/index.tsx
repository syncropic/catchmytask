// AccordionComponent.ts
// This component dynamically generates accordion sections based on the provided layout configuration.

import React from "react";
import { Accordion } from "@mantine/core";
import { AccordionSection } from "@components/interfaces";
import { useAppStore } from "src/store";
import { iconMap } from "@components/Utils";
import ComponentsToolbar from "@components/ComponentsToolbar";
import ExternalSubmitButton from "@components/SubmitButton";
import { useParsed } from "@refinedev/core";

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
  const { params } = useParsed();
  let action_input_form_values_key = `query_${params?.id || activeTask?.id}`;

  return (
    <Accordion multiple defaultValue={defaultExpandedValues || []}>
      {sections.map(
        (section) =>
          section.isVisible !== false && ( // Only render if the section is visible
            <Accordion.Item
              value={section?.key || restProps?.action || restProps?.key}
              key={section?.key || restProps?.action || restProps?.key}
            >
              <Accordion.Control
                icon={
                  iconMap[section?.icon || restProps?.action || section?.key]
                    ? React.createElement(
                        iconMap[
                          section?.icon || restProps?.action || section?.key
                        ],
                        { size: 16 }
                      )
                    : null
                }
              >
                <div className="flex justify-between items-center">
                  {/* Check if title is a string, otherwise render as a React component */}
                  {/* {section?.key} */}
                  {typeof section?.title ||
                  restProps?.action ||
                  restProps?.title === "string"
                    ? section?.title || restProps?.action || restProps?.title
                    : React.isValidElement(
                        section?.title || restProps?.action || restProps?.title
                      )
                    ? section?.title || restProps?.action || restProps?.title
                    : typeof section?.title ||
                      restProps?.action ||
                      restProps?.title === "function"
                    ? React.createElement(
                        section?.title || restProps?.action || restProps?.title
                      )
                    : null}
                  {restProps?.include_items?.includes("toolbar") && (
                    <>
                      <div
                        className="flex p-3 gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalSubmitButton
                          record={{}}
                          entity_type="views"
                          // ActionComponent={CustomIconPlayerPlayButton}
                          action={"save"}
                          // action_form_key={`query_${record?.id}`}
                          action_form_key={action_input_form_values_key}
                          // invalidate_query_key={query_key}
                        />
                        <ExternalSubmitButton
                          record={{}}
                          entity_type="views"
                          // ActionComponent={CustomIconPlayerPlayButton}
                          action={"reset"}
                          // action_form_key={`query_${record?.id}`}
                          action_form_key={action_input_form_values_key}
                          // invalidate_query_key={query_key}
                        />
                        {/* <ComponentsToolbar
                      include_components={[
                        {
                          action: "save",
                          // entity_type: entity_type || "action_steps",
                          entity_type: "views",
                          type: "action",
                          record: activeTask,
                          // onClick: updateComponentAction,
                          onClick: () => console.log("hello"),
                        },
                        // {
                        //   action: "upload",
                        //   // entity_type: entity_type || "action_steps",
                        //   entity_type: "views",
                        //   type: "action",
                        //   record: activeTask,
                        //   // onClick: updateComponentAction,
                        //   onClick: () => console.log("hello"),
                        // },
                      ]}
                    /> */}
                      </div>
                    </>
                  )}
                </div>
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
