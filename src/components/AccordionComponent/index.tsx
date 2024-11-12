// AccordionComponent.ts
// This component dynamically generates accordion sections based on the provided layout configuration.

import React, { useState } from "react";
import { Accordion, Tooltip, Text } from "@mantine/core";
import { AccordionSection } from "@components/interfaces";
import { useAppStore } from "src/store";
import { iconMap } from "@components/Utils";
import ComponentsToolbar from "@components/ComponentsToolbar";
import ExternalSubmitButton from "@components/SubmitButton";
import { useParsed } from "@refinedev/core";
import Reveal from "@components/Reveal";
import { IconInfoCircle } from "@tabler/icons-react";
import { useViewportSize } from "@mantine/hooks";
import CustomComponentsView from "@components/CustomComponentsView";
import SearchInput from "@components/SearchInput";

interface AccordionComponentProps {
  sections: AccordionSection[]; // The sections to render in the accordion
  [key: string]: any; // Additional props of any type
}

const AccordionComponent: React.FC<AccordionComponentProps> = ({
  sections,
  defaultExpandedValues,
  ...restProps
}) => {
  const { activeTask, activeSession, setActiveActionSteps, activeActionSteps } =
    useAppStore();
  const [opened, setOpened] = useState(false);
  const { params } = useParsed();
  const { width } = useViewportSize();
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
                  {/* {restProps?.include_items?.includes("action_input") && (
                    <>
                      <div onClick={(e) => e.stopPropagation()}>
                        <SearchInput
                          placeholder="profiles"
                          description={undefined}
                          handleOptionSubmit={setActiveActionSteps}
                          value={activeActionSteps || []}
                          withinPortal={true}
                          // ref={ref}
                          // include_action_icons={[
                          //   "edit",
                          //   "add_new",
                          //   "record_info",
                          // ]}
                          // handleEdit={handleEdit}
                          record={{}}
                          query_name="fetch profiles"
                          // navigateOnSelect={{ resource: "views" }}
                          // navigateOnClear={{ resource: "home" }}
                          data_items={[
                            {
                              name: "fetch audio from spotify",
                              id: "123",
                              author_id: "dpwanjala@gmail.com",
                              description: "fetch audio from spotify",
                            },
                          ]}
                          activeFilters={[
                            {
                              id: 1,
                              name: "profiles",
                              description: "profiles",
                              entity_type: "profiles",
                              is_selected: true,
                            },
                          ]}
                        ></SearchInput>
                      </div>
                    </>
                  )} */}
                  {restProps?.include_items?.includes("toolbar") && (
                    <>
                      <div
                        className="flex p-3 gap-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Reveal
                          trigger="click"
                          opened={opened}
                          target={
                            <Tooltip
                              multiline
                              w={220}
                              withArrow
                              transitionProps={{ duration: 200 }}
                              label={"set custom components"}
                              onClick={() => setOpened(!opened)}
                            >
                              <div className="flex">
                                <Text
                                  size="sm"
                                  className="text-blue-500 truncate overflow-hidden whitespace-nowrap px-3"
                                  style={{ maxWidth: width < 500 ? 100 : 500 }}
                                >
                                  set custom components
                                </Text>
                                <IconInfoCircle size={18} />
                              </div>
                            </Tooltip>
                          }
                        >
                          <CustomComponentsView
                            handleClose={setOpened}
                          ></CustomComponentsView>
                        </Reveal>
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
