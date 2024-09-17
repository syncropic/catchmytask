import NaturalLanguageQuery from "@components/NaturalLanguageQuery";
import {
  getComponentByKey,
  truncateText,
  useFetchDomainDataByDomain,
} from "@components/Utils";
import { ComponentKey, ISession } from "@components/interfaces";
import {
  Accordion,
  Button,
  Tabs,
  Textarea,
  Text,
  Slider,
  Highlight,
  Tooltip,
  ActionIcon,
  useComputedColorScheme,
  Indicator,
} from "@mantine/core";
import {
  Authenticated,
  HttpError,
  useGo,
  useIsAuthenticated,
  useList,
  useOne,
  useParsed,
} from "@refinedev/core";
import {
  IconForms,
  IconGauge,
  IconLanguage,
  IconListCheck,
  IconListDetails,
  IconSettings,
  IconSettingsAutomation,
  IconEdit,
  IconSearch,
  IconVariable,
  IconCode,
  IconStackBack,
  IconBuilding,
  IconListTree,
  IconPin,
  IconQuestionMark,
  IconLetterQ,
  IconCircleMinus,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppLayout } from "src/components/Layout/AppLayout";
import { useAppStore, useTransientStore } from "src/store";
import StateView from "@components/StateView";
import ActionInput, { ActionInputWrapper } from "@components/ActionInput";
import SelectAction from "@components/SelectAction";
import SearchComponent from "@components/Search";
import ActionSteps, { ActionStepsWrapper } from "@components/ActionSteps";
import MonacoEditor from "@components/MonacoEditor";
import TaskInputWrapper from "@components/TaskInput";
import { useSession } from "next-auth/react";
import ResizeHandle from "@components/ResizeHandle";
import SelectSession from "@components/SelectSession";
import SearchInput from "@components/SearchInput";
import Breadcrumbs from "@components/Breadcrumbs";
import QuickActionsBar from "@components/QuickActionsBar";
import ComponentsToolbar from "@components/ComponentsToolbar";
import Automation from "@components/Automation";
import FilterComponent from "@components/Filter";
import { useMediaQuery } from "@mantine/hooks";
import Board from "@components/Board";
import ExternalSubmitButton from "@components/SubmitButton";
import ActionInputToolbar from "@components/ActionInputToolbar";
import { LogsWrapper } from "@components/LogsViewer";
import Reveal from "@components/Reveal";

function InitializeApplication({
  activeApplicationId,
  children,
}: {
  activeApplicationId?: string;
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}

const Layout = ({
  children,
  noAuth,
}: {
  children: React.ReactNode;
  noAuth?: boolean;
}) => {
  const { isLoading, data: authenticatedData } = useIsAuthenticated();
  const {
    activeLayout,
    activeActionInputLayout,
    setActiveApplication,
    activeSession,
    activeTask,
    activeSections,
    setActiveSections,
    sessionConfig,
    colorScheme,
    entity_types,
    setEntityTypes,
    focused_entities,
    setFocusedEntities,
    action,
  } = useAppStore();
  const computedColorScheme = useComputedColorScheme("light"); // Compute the color scheme, defaults to 'light'
  // Define a media query for large screens
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  // Determine whether the panel should be displayed
  const shouldDisplayLeftSection =
    activeLayout?.leftSection?.isDisplayed && isLargeScreen;
  const shouldDisplayRightSection =
    activeLayout?.rightSection?.isDisplayed && isLargeScreen;

  const shouldDisplayActionInputLeftSection =
    activeActionInputLayout?.leftSection?.isDisplayed && isLargeScreen;
  const shouldDisplayActionInputRightSection =
    activeActionInputLayout?.rightSection?.isDisplayed && isLargeScreen;

  // Determine the effective scheme to use
  const effectiveScheme =
    colorScheme.scheme === "auto" ? computedColorScheme : colorScheme.scheme;
  const go = useGo();
  const parsed = useParsed();
  const runtimeConfig = useAppStore((state) => state.runtimeConfig);

  let state = {
    domain_url: runtimeConfig?.DOMAIN_URL,
  };
  const {
    data: domainData,
    isLoading: domainDataIsLoading,
    error: domainDataError,
  } = useFetchDomainDataByDomain(state);

  let domainRecord = domainData?.data?.find(
    (item: any) => item?.message?.code === "query_success_results"
  )?.data[0];

  // handle toggleDisplay
  const toggleSectionPinned = (e: any, section: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeSections) {
      const newActiveSections = { ...activeSections };
      // console.log("newLayout", newLayout);
      newActiveSections[section].isPinned =
        !newActiveSections[section]?.isPinned;
      setActiveSections(newActiveSections);
    }
  };

  const updateComponentInputMode = (
    e: any,
    entity_type: string,
    action: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (entity_types) {
      const new_entity_types = { ...entity_types };

      // Ensure the entity_type exists in new_entity_types, or initialize it
      if (!new_entity_types[entity_type]) {
        new_entity_types[entity_type] = {};
      }

      // Toggle logic: If inputMode is already set to action, set it to null, otherwise set it to the action
      if (new_entity_types[entity_type].inputMode === action) {
        new_entity_types[entity_type].inputMode = null;
      } else {
        new_entity_types[entity_type].inputMode = action;
      }

      setEntityTypes(new_entity_types);
    } else {
      console.log("no entity types");
    }
  };

  const updateComponentAction = (
    e: any,
    record: any,
    entity_type: string,
    action: string,
    type: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (focused_entities) {
      const new_focused_entities = { ...focused_entities };
      //   console.log("new_focused_entities", new_focused_entities);
      //   console.log("id", id);
      if (!new_focused_entities[record?.id]) {
        new_focused_entities[record?.id] = {};
      }
      if (new_focused_entities[record?.id].action === action) {
        new_focused_entities[record?.id].action = null;
      } else {
        new_focused_entities[record?.id].action = action;
      }
      setFocusedEntities(new_focused_entities);
    }
  };

  const updateActionInputTool = (
    e: any,
    record: any,
    entity_type: string,
    action: string,
    type: string,
    tool: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const specialActions = ["reset"]; // List of special actions
    const action_name = specialActions.includes(action) ? "execute" : action; // Check if action is in the list and replace if necessary

    if (focused_entities) {
      const new_focused_entities = { ...focused_entities };
      //   console.log("new_focused_entities", new_focused_entities);
      // console.log("id", record?.id);
      // console.log("action", action);
      if (!new_focused_entities[record?.id]) {
        new_focused_entities[record?.id] = {};
      }
      if (new_focused_entities[record?.id].action === action_name) {
        // new_focused_entities[record?.id].action = null;
        new_focused_entities[record?.id].action = action_name;
      } else {
        new_focused_entities[record?.id].action = action_name;
      }
      setFocusedEntities(new_focused_entities);
    }
  };

  // const handleModeSelection = (item: any, id: string, action: string) => {
  //   // console.log("Mode selection item:", item);
  //   // console.log("Mode selection id:", id);
  //   // console.log("Mode selection action:", action);

  //   if (focused_entities) {
  //     const new_focused_entities = { ...focused_entities };

  //     // Ensure that the entity exists in the state
  //     if (!new_focused_entities[id]) {
  //       new_focused_entities[id] = {};
  //     }

  //     // Define the mode key based on the action
  //     const modeKey = `${action}_mode`;

  //     // Toggle the mode or set it to the new item
  //     if (new_focused_entities[id][modeKey] === item) {
  //       new_focused_entities[id][modeKey] = null; // Clear if already selected
  //     } else {
  //       new_focused_entities[id][modeKey] = item; // Set new item
  //     }

  //     // Update the state with the modified focused_entities
  //     setFocusedEntities(new_focused_entities);
  //   }
  // };

  useEffect(() => {
    if (domainRecord?.["application"]) {
      setActiveApplication(domainRecord?.["application"]);
    }
  }, [domainRecord]);

  if (isLoading || domainDataIsLoading) {
    return <>Loading...</> || null;
  }

  if (domainDataError) {
    return <>{JSON.stringify(domainDataError)}</>;
  }

  if (!authenticatedData?.authenticated && parsed?.pathname == "/login") {
    return <>{children}</>;
  }

  if (!authenticatedData?.authenticated && parsed?.pathname == "/") {
    let domain_data =
      domainData?.data?.find(
        (item: any) => item?.message?.code === "query_success_results"
      )?.data?.[0] || {};

    let visible_sections =
      domain_data?.domain?.metadata?.visible_sections || null;
    let application = domain_data?.application || null;

    return (
      <>
        <AppLayout authenticatedData={authenticatedData}>
          <InitializeApplication>
            <>
              {visible_sections &&
                visible_sections.map((section: string) => {
                  const Component = getComponentByKey(section as ComponentKey);
                  return (
                    <Component
                      title={application["titles"]?.find(
                        (title: any) =>
                          title["metadata"]["section"] === `${section}`
                      )}
                      items={application[section]}
                      entity_type={section}
                      key={section}
                    ></Component>
                  );
                })}
            </>
          </InitializeApplication>
        </AppLayout>
      </>
    );
  }

  if (!authenticatedData?.authenticated && parsed?.pathname !== "/login") {
    return (
      <>
        <Button
          size="xs"
          onClick={() => {
            go({
              to: "/login",
              type: "push",
            });
          }}
        >
          Sign In
        </Button>
      </>
    );
  }

  return (
    <Authenticated key="home" redirectOnFail="/login">
      <AppLayout authenticatedData={authenticatedData}>
        {sessionConfig?.interaction_mode == "background" && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            {authenticatedData?.authenticated &&
              activeLayout?.quickActionsBar?.isDisplayed && (
                <>
                  <div
                    className={`block lg:hidden p-2 ${
                      effectiveScheme === "light"
                        ? "bg-gray-100"
                        : "bg-gray-800"
                    }`}
                  >
                    <QuickActionsBar />
                  </div>
                  <div
                    className={`block lg:hidden p-2 ${
                      effectiveScheme === "light"
                        ? "bg-gray-100"
                        : "bg-gray-800"
                    }`}
                  >
                    {activeLayout?.mobileStateView?.isDisplayed && (
                      <Accordion defaultValue={["state"]} multiple={true}>
                        <Accordion.Item key="state" value="state">
                          <Accordion.Control icon={<IconStackBack size={16} />}>
                            State <Breadcrumbs />
                            <Text component="span" fw={700}>
                              {activeSession?.internal_id}
                            </Text>
                          </Accordion.Control>
                          <Accordion.Panel>
                            <StateView />
                          </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item key="logs" value="logs">
                          <Accordion.Control icon={<IconListTree size={16} />}>
                            Logs
                          </Accordion.Control>
                          <Accordion.Panel>
                            <div className="flex items-center justify-center p-4">
                              <p
                                className={`text-sm ${
                                  effectiveScheme === "light"
                                    ? "text-gray-600"
                                    : "text-gray-300"
                                } text-center`}
                              >
                                Live updating execution feedback from the system
                              </p>
                            </div>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    )}

                    {activeLayout?.mobileCustomComponents?.isDisplayed && (
                      <Accordion defaultValue={[]} multiple={true}>
                        <div className="flex items-center justify-center p-4">
                          <p
                            className={`text-sm ${
                              effectiveScheme === "light"
                                ? "text-gray-600"
                                : "text-gray-300"
                            } text-center`}
                          >
                            Personalize your interface further by including and
                            configuring prebuilt and/or custom built components
                            here.
                          </p>
                        </div>
                      </Accordion>
                    )}
                  </div>
                </>
              )}
            <Accordion
              defaultValue={[
                "natural_language_query",
                "session_config",
                "automation_config",
              ]}
              multiple={true}
            >
              <Accordion.Item
                key="natural_language_query"
                value="natural_language_query"
              >
                <Accordion.Control icon={<IconLanguage size={16} />}>
                  Query
                </Accordion.Control>
                <Accordion.Panel>
                  <ActionInputWrapper
                    name="task"
                    query_name="data_model"
                    record={activeTask}
                    exclude_components={["input_mode", "submit_button"]}
                    success_message_code="action_input_data_model_schema"
                    update_action_input_form_values_on_submit_success={true}
                    nested_component={{
                      data_model: {
                        name: "task_config",
                      },
                    }}
                    endpoint="plan"
                    action_label="Catch"
                  >
                    <ActionInputWrapper
                      name="task_config"
                      query_name="data_model"
                      success_message_code="action_input_data_model_schema"
                      exclude_components={["input_mode", "submit_button"]}
                    ></ActionInputWrapper>
                  </ActionInputWrapper>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item key="automation_config" value="automation_config">
                <Accordion.Control icon={<IconSettingsAutomation size={16} />}>
                  Automation Config
                </Accordion.Control>
                <Accordion.Panel>
                  <Tabs defaultValue="basic" orientation="vertical">
                    <Tabs.List>
                      <Tabs.Tab value="basic">Basic</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic">
                      <div className="p-3">
                        <ActionInputWrapper
                          name="automation_config"
                          query_name="data_model"
                          exclude_components={["input_mode", "submit_button"]}
                          success_message_code="automation_action_input_data_model_schema"
                          update_action_input_form_values_on_submit_success={
                            true
                          }
                        ></ActionInputWrapper>
                      </div>
                    </Tabs.Panel>
                  </Tabs>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item key="session_config" value="session_config">
                <Accordion.Control icon={<IconSettings size={16} />}>
                  Session Config
                </Accordion.Control>
                <Accordion.Panel>
                  <Tabs defaultValue="basic" orientation="vertical">
                    <Tabs.List>
                      <Tabs.Tab value="basic">Basic</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic">
                      <div className="p-3">
                        <ActionInputWrapper
                          name="session_config"
                          query_name="data_model"
                          record={activeSession}
                          exclude_components={["input_mode", "submit_button"]}
                          success_message_code="session_action_input_data_model_schema"
                          update_action_input_form_values_on_submit_success={
                            true
                          }
                        ></ActionInputWrapper>
                      </div>
                    </Tabs.Panel>
                  </Tabs>
                </Accordion.Panel>
              </Accordion.Item>

              <div className="flex m-3 justify-end">
                <Button>Submit</Button>
              </div>
            </Accordion>
          </div>
        )}
        {["interactive", "any"]?.includes(sessionConfig?.interaction_mode) && (
          <PanelGroup direction="horizontal">
            <Panel
              defaultSize={20}
              minSize={0}
              id="left"
              style={{
                display: shouldDisplayLeftSection ? "block" : "none",
              }}
            >
              <div
                className={`lg:block overflow-auto h-screen ${
                  effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800"
                }`}
                style={{
                  height: "calc(100vh - 64px)",
                }}
              >
                <Accordion defaultValue={[]} multiple={true}>
                  <div className="flex items-center justify-center p-4">
                    <p
                      className={`text-sm ${
                        effectiveScheme === "light"
                          ? "text-gray-600"
                          : "text-gray-300"
                      } text-center`}
                    >
                      Personalize your interface further by including and
                      configuring prebuilt and/or custom built components here.
                    </p>
                  </div>
                </Accordion>
              </div>
            </Panel>

            <PanelResizeHandle>
              <ResizeHandle />
            </PanelResizeHandle>

            <Panel
              defaultSize={60}
              minSize={30}
              id="center"
              style={{
                display: activeLayout?.centerSection?.isDisplayed
                  ? "block"
                  : "none",
              }}
            >
              {authenticatedData?.authenticated &&
                activeLayout?.quickActionsBar?.isDisplayed && (
                  <>
                    <div
                      className={`block lg:hidden p-2 ${
                        effectiveScheme === "light"
                          ? "bg-gray-100"
                          : "bg-gray-800"
                      }`}
                    >
                      <QuickActionsBar />
                    </div>
                    <div
                      className={`block lg:hidden p-2 ${
                        effectiveScheme === "light"
                          ? "bg-gray-100"
                          : "bg-gray-800"
                      }`}
                    >
                      <div className="p-3">
                        <SearchInput />
                      </div>
                      {/* <StateView /> */}
                      {activeLayout?.mobileStateView?.isDisplayed && (
                        <Accordion defaultValue={["state"]} multiple={true}>
                          <Accordion.Item key="state" value="state">
                            <Accordion.Control
                              icon={<IconStackBack size={16} />}
                            >
                              State <Breadcrumbs />
                              <Text component="span" fw={700}>
                                {activeSession?.internal_id}
                              </Text>
                            </Accordion.Control>
                            <Accordion.Panel>
                              <StateView />
                            </Accordion.Panel>
                          </Accordion.Item>
                          <Accordion.Item key="logs" value="logs">
                            <Accordion.Control
                              icon={<IconListTree size={16} />}
                            >
                              Logs
                            </Accordion.Control>
                            <Accordion.Panel>
                              <div className="flex items-center justify-center p-4">
                                <p
                                  className={`text-sm ${
                                    effectiveScheme === "light"
                                      ? "text-gray-600"
                                      : "text-gray-300"
                                  } text-center`}
                                >
                                  Live updating execution feedback from the
                                  system
                                </p>
                              </div>
                            </Accordion.Panel>
                          </Accordion.Item>
                        </Accordion>
                      )}
                      {activeLayout?.mobileCustomComponents?.isDisplayed && (
                        <Accordion defaultValue={[]} multiple={true}>
                          <div className="flex items-center justify-center p-4">
                            <p
                              className={`text-sm ${
                                effectiveScheme === "light"
                                  ? "text-gray-600"
                                  : "text-gray-300"
                              } text-center`}
                            >
                              Personalize your interface further by including
                              and configuring prebuilt and/or custom built
                              components here.
                            </p>
                          </div>
                        </Accordion>
                      )}
                    </div>
                  </>
                )}
              {!activeSession && (
                <div
                  className="flex flex-col h-screen items-center justify-center p-4"
                  style={{
                    height: "calc(100vh - 64px)",
                    paddingBottom: "60px",
                  }}
                >
                  <Breadcrumbs />
                  <p className="text-sm text-gray-600 text-center max-w-sm">
                    <Highlight color="violet" highlight="session">
                      Please create a new session or get started from an
                      existing to continue.
                    </Highlight>
                  </p>
                </div>
              )}

              {!activeTask && activeSession && (
                <div
                  className="flex flex-col h-screen items-center justify-center p-4"
                  style={{
                    height: "calc(100vh - 64px)",
                    paddingBottom: "60px",
                  }}
                >
                  <Breadcrumbs />
                  <p className="text-sm text-gray-600 text-center max-w-sm">
                    <Highlight color="lime" highlight="task">
                      Please create a new task or get started from an existing
                      one to continue.
                    </Highlight>
                  </p>
                </div>
              )}
              {activeSession && activeTask && (
                <div
                  className="flex flex-col h-screen overflow-auto"
                  style={{
                    height: "calc(100vh - 64px)",
                    paddingBottom: "60px",
                  }}
                >
                  {/* <div className="flex justify-center items-center bg-gray-100 min-h-[20px] pb-3">
                  <Breadcrumbs />
                </div> */}

                  {/* {activeLayout?.searchInput?.isDisplayed && (
                    <div className="block lg:hidden p-2 bg-gray-100">
                      <SearchInput />
                    </div>
                  )} */}

                  <Accordion
                    defaultValue={["natural_language_query", "action_plan"]}
                    multiple={true}
                  >
                    <Accordion.Item
                      key="natural_language_query"
                      value="natural_language_query"
                    >
                      <Accordion.Control icon={<IconLetterQ size={16} />}>
                        <div className="flex justify-between items-center">
                          <div>Task</div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Reveal
                              trigger="click"
                              target={
                                <Indicator
                                  // inline
                                  label="i"
                                  // size={16}
                                  // color="blue"
                                  // variant="outline"
                                  offset={3}
                                >
                                  <Text
                                    truncate="end"
                                    size="xs"
                                    className="text-blue-500 pl-3 pr-3"
                                  >
                                    {truncateText(`${activeTask?.name}`, 3)}
                                  </Text>
                                </Indicator>
                              }
                            >
                              <MonacoEditor
                                value={activeTask}
                                language="json"
                                height="50vh"
                              />
                            </Reveal>
                          </div>

                          <div className="pr-3">
                            <ComponentsToolbar
                              include_components={[
                                // {
                                //   action: "display",
                                //   entity_type: "action_steps",
                                //   type: "action",
                                //   record: activeTask,
                                //   onClick: updateComponentAction,
                                // },
                                // {
                                //   action: "query",
                                //   entity_type: "action_steps",
                                //   type: "action",
                                //   record: activeTask,
                                //   onClick: updateComponentAction,
                                // },
                                {
                                  action: "implement",
                                  entity_type: "tasks",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                                {
                                  action: "execute",
                                  entity_type: "tasks",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                                // {
                                //   action: "save",
                                //   entity_type: "action_steps",
                                //   type: "action",
                                //   record: activeTask,
                                //   onClick: updateComponentAction,
                                // },
                                {
                                  action: "share",
                                  entity_type: "tasks",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                                {
                                  action: "pin",
                                  entity_type: "tasks",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                                // {
                                //   action: "cancel",
                                //   entity_type: "action_steps",
                                //   type: "action",
                                //   record: activeTask,
                                //   onClick: updateComponentAction,
                                // },
                              ]}
                            ></ComponentsToolbar>
                          </div>
                        </div>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <PanelGroup direction="horizontal">
                          <Panel
                            defaultSize={30}
                            minSize={0}
                            id="left"
                            style={{
                              display: shouldDisplayActionInputLeftSection
                                ? "block"
                                : "none",
                            }}
                          ></Panel>

                          <PanelResizeHandle>
                            <ResizeHandle />
                          </PanelResizeHandle>

                          <Panel
                            defaultSize={40}
                            minSize={30}
                            id="center"
                            style={{
                              display: activeActionInputLayout?.centerSection
                                ?.isDisplayed
                                ? "block"
                                : "none",
                            }}
                          >
                            {/* {focused_entities["action_input"]?.action ? (
                              <div className="w-full">
                                <ActionInputWrapper
                                  name="task"
                                  query_name="data_model"
                                  record={activeTask}
                                  action={
                                    focused_entities[activeTask?.id]?.action
                                  }
                                  success_message_code="action_input_data_model_schema"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center p-4">
                                <p className="text-sm text-gray-600 text-center">
                                  action steps action
                                </p>
                              </div>
                            )} */}
                            <div className="w-full">
                              <ActionInputWrapper
                                name="task"
                                query_name="data_model"
                                record={activeTask}
                                action={
                                  focused_entities[activeTask?.id]?.action ||
                                  action
                                }
                                success_message_code="action_input_data_model_schema"
                              />
                            </div>
                          </Panel>

                          <PanelResizeHandle>
                            <ResizeHandle />
                          </PanelResizeHandle>

                          <Panel
                            defaultSize={30}
                            minSize={0}
                            id="right"
                            style={{
                              display: shouldDisplayActionInputRightSection
                                ? "block"
                                : "none",
                            }}
                          >
                            {/* <div
                              className={`overflow-auto  p-3 ${
                                effectiveScheme === "light"
                                  ? "bg-gray-100"
                                  : "bg-gray-800"
                              }`}
                              // style={{ height: "calc(100vh - 64px)" }}
                            >
                              <LogsWrapper
                                record={activeTask}
                              />
                            </div> */}
                          </Panel>
                        </PanelGroup>
                        {/* <ActionInputWrapper
                          name="task"
                          query_name="data_model"
                          exclude_components={["input_mode", "submit_button"]}
                          record={activeTask}
                          success_message_code="action_input_data_model_schema"
                          update_action_input_form_values_on_submit_success={
                            true
                          }
                          nested_component={{
                            data_model: {
                              name: "task_config",
                            },
                          }}
                          endpoint="plan"
                          action_label="Catch"
                        >
                          <ActionInputWrapper
                          name="task_config"
                          query_name="data_model"
                          success_message_code="action_input_data_model_schema"
                          exclude_components={["input_mode", "submit_button"]}
                        ></ActionInputWrapper>
                        </ActionInputWrapper> */}
                      </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item key="action_input" value="action_input">
                      <Accordion.Control icon={<IconForms size={16} />}>
                        <div className="flex justify-between items-center">
                          <div>action input</div>
                          <div
                            className="max-w-xs flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* <SearchInput
                              placeholder={`Search for ${
                                focused_entities[activeTask?.id]?.["action"]
                              } modes`}
                              handleOptionSubmit={(item) =>
                                handleModeSelection(
                                  item,
                                  activeTask?.id,
                                  focused_entities[activeTask?.id]?.["action"]
                                )
                              }
                              activeFilters={[
                                {
                                  id: 1,
                                  name: `${
                                    focused_entities[activeTask?.id]?.["action"]
                                  } modes`,
                                  description: `${
                                    focused_entities[activeTask?.id]?.["action"]
                                  } modes`,
                                  entity_type: `${
                                    focused_entities[activeTask?.id]?.["action"]
                                  } modes`,
                                  is_selected: true,
                                },
                              ]}
                            /> */}
                            <div
                              className="p-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {activeTask && (
                                <ExternalSubmitButton
                                  record={activeTask}
                                  entity_type="tasks"
                                  action={
                                    focused_entities[activeTask?.id]?.[
                                      "action"
                                    ] || action
                                  }
                                ></ExternalSubmitButton>
                                // <div>{JSON.stringify(action)}</div>
                              )}
                            </div>
                          </div>

                          <div className="pr-3">
                            <ActionInputToolbar
                              include_components={[
                                // {
                                //   action: "display",
                                //   tool: "display",
                                //   entity_type:
                                //     focused_entities["action_input"]
                                //       ?.entity_type,
                                //   type: "action",
                                //   record: activeTask,
                                //   onClick: updateActionInputTool,
                                // },
                                {
                                  action: "clear",
                                  tool: "clear",
                                  entity_type: "action_input",
                                  // entity_type:
                                  //   focused_entities["action_input"]
                                  //     ?.entity_type,
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateActionInputTool,
                                },
                                {
                                  action: "reset",
                                  tool: "reset",
                                  entity_type: "action_input",
                                  // entity_type:
                                  //   focused_entities["action_input"]
                                  //     ?.entity_type,
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateActionInputTool,
                                },
                              ]}
                            ></ActionInputToolbar>
                          </div>
                        </div>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <PanelGroup direction="horizontal">
                          <Panel
                            defaultSize={30}
                            minSize={0}
                            id="left"
                            style={{
                              display: shouldDisplayActionInputLeftSection
                                ? "block"
                                : "none",
                            }}
                          ></Panel>

                          <PanelResizeHandle>
                            <ResizeHandle />
                          </PanelResizeHandle>

                          <Panel
                            defaultSize={40}
                            minSize={30}
                            id="center"
                            style={{
                              display: activeActionInputLayout?.centerSection
                                ?.isDisplayed
                                ? "block"
                                : "none",
                            }}
                          >
                            {focused_entities["action_input"]?.action ? (
                              <div className="w-full">
                                <ActionInputWrapper
                                  execution_record={activeTask}
                                  query_name="execution data model"
                                  record={{}}
                                  action={
                                    focused_entities["action_input"]?.action
                                  }
                                  focused_item="action_input"
                                  success_message_code="action_input_data_model_schema"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center p-4">
                                <p className="text-sm text-gray-600 text-center">
                                  Prompts for your input required to
                                  successfully complete an action will
                                  dynamically appear here.
                                </p>
                              </div>
                            )}
                          </Panel>

                          <PanelResizeHandle>
                            <ResizeHandle />
                          </PanelResizeHandle>

                          <Panel
                            defaultSize={30}
                            minSize={0}
                            id="right"
                            style={{
                              display: shouldDisplayActionInputRightSection
                                ? "block"
                                : "none",
                            }}
                          >
                            {/* <div
                              className={`overflow-auto  p-3 ${
                                effectiveScheme === "light"
                                  ? "bg-gray-100"
                                  : "bg-gray-800"
                              }`}
                              // style={{ height: "calc(100vh - 64px)" }}
                            >
                              <LogsWrapper
                                record={activeTask}
                              />
                            </div> */}
                          </Panel>
                        </PanelGroup>
                      </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item key="action_plan" value="action_plan">
                      <Accordion.Control icon={<IconListDetails size={16} />}>
                        <div className="flex justify-between items-center">
                          <div>action_steps</div>
                          {/* <div
                            className="max-w-xs flex items-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SearchInput
                              placeholder={`Search for ${
                                focused_entities[activeTask?.id]?.["action"]
                              } modes`}
                              // description={`${entity_types["action_steps"]?.["action"]} mode`}
                              handleOptionSubmit={(item) =>
                                handleModeSelection(
                                  item,
                                  activeTask?.id,
                                  focused_entities[activeTask?.id]?.["action"]
                                )
                              }
                              // value={activeTask?.name || ""}
                              // include_action_icons={["remove_from_state"]}
                              activeFilters={[
                                {
                                  id: 1,
                                  name: `${
                                    focused_entities[activeTask?.id]?.["action"]
                                  } modes`,
                                  description: `${
                                    focused_entities[activeTask?.id]?.["action"]
                                  } modes`,
                                  entity_type: `${
                                    focused_entities[activeTask?.id]?.["action"]
                                  } modes`,
                                  is_selected: true,
                                },
                              ]}
                            />
                            <div
                              className="p-3"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalSubmitButton
                                record={activeTask}
                                entity_type="action_steps"
                                action={
                                  focused_entities[activeTask?.id]?.["action"]
                                }
                              ></ExternalSubmitButton>
                            </div>
                          </div> */}

                          <div>
                            <ComponentsToolbar
                              include_components={[
                                {
                                  action: "display",
                                  entity_type: "action_steps",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                                {
                                  action: "query",
                                  entity_type: "action_steps",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                                {
                                  action: "execute",
                                  entity_type: "action_steps",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                                {
                                  action: "save",
                                  entity_type: "action_steps",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                                {
                                  action: "share",
                                  entity_type: "action_steps",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                                {
                                  action: "cancel",
                                  entity_type: "action_steps",
                                  type: "action",
                                  record: activeTask,
                                  onClick: updateComponentAction,
                                },
                              ]}
                            ></ComponentsToolbar>
                          </div>
                        </div>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <div className="w-full">
                          <PanelGroup direction="horizontal">
                            <Panel
                              defaultSize={30}
                              minSize={0}
                              id="left"
                              style={{
                                display: shouldDisplayActionInputLeftSection
                                  ? "block"
                                  : "none",
                              }}
                            >
                              {/* <div
                              className={`overflow-auto ${
                                effectiveScheme === "light"
                                  ? "bg-gray-100"
                                  : "bg-gray-800"
                              }`}
                              // style={{ height: "calc(100vh - 64px)" }}
                            >
                              conversation history
                            </div> */}
                            </Panel>

                            <PanelResizeHandle>
                              <ResizeHandle />
                            </PanelResizeHandle>

                            <Panel
                              defaultSize={40}
                              minSize={30}
                              id="center"
                              style={{
                                display: activeActionInputLayout?.centerSection
                                  ?.isDisplayed
                                  ? "block"
                                  : "none",
                              }}
                            ></Panel>

                            <PanelResizeHandle>
                              <ResizeHandle />
                            </PanelResizeHandle>

                            <Panel
                              defaultSize={30}
                              minSize={0}
                              id="right"
                              style={{
                                display: shouldDisplayActionInputRightSection
                                  ? "block"
                                  : "none",
                              }}
                            >
                              {/* <div
                              className={`overflow-auto  p-3 ${
                                effectiveScheme === "light"
                                  ? "bg-gray-100"
                                  : "bg-gray-800"
                              }`}
                              // style={{ height: "calc(100vh - 64px)" }}
                            >
                              <LogsWrapper
                                record={activeTask}
                              />
                            </div> */}
                            </Panel>
                          </PanelGroup>
                          <div>
                            <ActionStepsWrapper
                              entity_type="action_steps"
                              record={activeTask}
                              ui={{ rowExpansionTrigger: "always" }}
                              nested_item="action_steps"
                              exclude_components={[]}
                              success_message_code="action_plan"
                            />
                          </div>
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </div>
              )}
            </Panel>

            <PanelResizeHandle>
              <ResizeHandle />
            </PanelResizeHandle>

            <Panel
              defaultSize={20}
              minSize={0}
              id="right"
              style={{
                display: shouldDisplayRightSection ? "block" : "none",
              }}
            >
              <div
                className={`overflow-auto h-screen ${
                  effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800"
                }`}
                style={{ height: "calc(100vh - 64px)" }}
              >
                <Accordion defaultValue={["logs"]} multiple={true}>
                  <Accordion.Item key="state" value="state">
                    <Accordion.Control icon={<IconStackBack size={16} />}>
                      State <Breadcrumbs />
                      <Text component="span" fw={700}>
                        {activeSession?.internal_id}
                      </Text>
                    </Accordion.Control>
                    <Accordion.Panel>
                      <StateView />
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item key="logs" value="logs">
                    <Accordion.Control icon={<IconListTree size={16} />}>
                      Logs
                    </Accordion.Control>
                    <Accordion.Panel>
                      <div className="flex items-center justify-center p-4">
                        <p
                          className={`text-sm ${
                            effectiveScheme === "light"
                              ? "text-gray-600"
                              : "text-gray-300"
                          } text-center`}
                        >
                          Live updating execution feedback from the system
                        </p>
                      </div>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </div>
            </Panel>
          </PanelGroup>
        )}
      </AppLayout>
    </Authenticated>
  );
};

export default Layout;
