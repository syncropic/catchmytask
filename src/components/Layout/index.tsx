import NaturalLanguageQuery from "@components/NaturalLanguageQuery";
import {
  getComponentByKey,
  iconMap,
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
  IconSitemap,
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
import PlanWrapper from "@components/Plan";
import GlobalSearchInput from "@components/GlobalSearchInput";
import BulkOperationsToolbar from "@components/BulkOperationsToolbar";

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
    setActiveLayout,
    activeActionInputLayout,
    setActiveApplication,
    setActiveSession,
    activeApplication,
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
    selectedRecords,
  } = useAppStore();
  const computedColorScheme = useComputedColorScheme("light"); // Compute the color scheme, defaults to 'light'
  // Define a media query for large screens
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");
  let action = focused_entities[activeTask?.id]?.["action"];

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

  // handle toggleDisplay
  const openDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = true;
      setActiveLayout(newLayout);
    }
  };

  const bulkActionSelect = (
    e: any,
    record: any,
    entity_type: string,
    action: string,
    type: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    // open right sidebar

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
    openDisplay("rightSection");
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

  useEffect(() => {
    if (domainRecord?.["application"]) {
      setActiveApplication(domainRecord?.["application"]);
    }
    // when there is no active session and there is a default session in the domain record, set the active session to the default session
    if (
      !activeSession &&
      domainRecord?.["application"]?.["defaults"]?.["session"]
    ) {
      setActiveSession(domainRecord?.["application"]["defaults"]["session"]);
    }
  }, [domainRecord]);

  useEffect(() => {
    if (authenticatedData?.authenticated && activeTask?.id) {
      // Construct the target URL
      const targetUrl = `/tasks/show/${activeTask.id}?applicationId=${activeApplication?.id}&sessionId=${activeSession?.id}`;

      // Check if the current URL is the same as the target URL
      if (window.location.pathname + window.location.search !== targetUrl) {
        // Perform the navigation if the target URL is different
        go({
          to: {
            resource: "tasks",
            action: "show",
            id: activeTask.id,
            meta: {
              applicationId: activeApplication?.id,
              sessionId: activeSession?.id,
              taskId: activeTask.id,
            },
          },
          query: {
            applicationId: activeApplication?.id,
            sessionId: activeSession?.id,
          },
          type: "push",
        });
      }
    }
  }, [authenticatedData, activeTask, activeApplication, activeSession, go]);

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
                        {/* <Accordion.Item key="logs" value="logs">
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
                        </Accordion.Item> */}
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
                            Pinned (or open in left sidebar) components will
                            appear here.
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
                  height: "calc(100vh - 100px)",
                }}
              >
                <Accordion defaultValue={["main_action"]} multiple={true}>
                  <div className="flex items-center justify-center">
                    <p
                      className={`text-sm ${
                        effectiveScheme === "light"
                          ? "text-gray-600"
                          : "text-gray-300"
                      } text-center`}
                    >
                      {/* Pinned (or open in left sidebar) components will appear
                      here. */}
                      Pinned
                    </p>
                  </div>
                  {action && (
                    <Accordion.Item key="main_action" value="main_action">
                      <Accordion.Control
                        icon={
                          iconMap[action]
                            ? React.createElement(iconMap[action], { size: 16 })
                            : null
                        }
                      >
                        {action}
                      </Accordion.Control>
                      <Accordion.Panel>
                        {/* // using different components for different actions to avoid conflicts */}
                        {activeTask && ["search"]?.includes(action) && (
                          <div className="w-full">
                            <ActionInputWrapper
                              name={action}
                              query_name="data_model"
                              record={activeTask}
                              action={action}
                              success_message_code="action_input_data_model_schema"
                            />
                          </div>
                        )}
                        {activeTask && ["save"]?.includes(action) && (
                          <div className="w-full">
                            <ActionInputWrapper
                              name={action}
                              query_name="data_model"
                              record={activeTask}
                              action={action}
                              success_message_code="action_input_data_model_schema"
                            />
                          </div>
                        )}
                      </Accordion.Panel>
                    </Accordion.Item>
                  )}
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
                      {/* <div className="p-3">
                        <SearchInput />
                      </div> */}
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
                          {/* <Accordion.Item key="logs" value="logs">
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
                          </Accordion.Item> */}
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
                    height: "calc(100vh - 100px)",
                    // paddingBottom: "60px",
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
                    height: "calc(100vh - 100px)",
                    // paddingBottom: "60px",
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
                    height: "calc(100vh - 100px)",
                    // paddingBottom: "60px",
                  }}
                >
                  <Accordion defaultValue={["execution"]} multiple={true}>
                    <Accordion.Item key="task" value="task">
                      <Accordion.Control icon={<IconLetterQ size={16} />}>
                        <div className="flex justify-between items-center">
                          <div>Task</div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Reveal
                              trigger="click"
                              target={
                                <Indicator label="i" offset={3}>
                                  <Text
                                    truncate="end"
                                    size="xs"
                                    className="text-blue-500 pl-3 pr-3"
                                  >
                                    {activeTask?.name}
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
                              include_components={[]}
                            ></ComponentsToolbar>
                          </div>
                        </div>
                      </Accordion.Control>
                      <Accordion.Panel></Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item key="execution" value="execution">
                      <Accordion.Control icon={<IconListDetails size={16} />}>
                        <div className="flex justify-between items-center">
                          <div>Execution</div>
                          <div
                            className="p-3"
                            onClick={(e) => e.stopPropagation()}
                          >
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
                                        value={selectedRecords["issues"]}
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
                                  ></ExternalSubmitButton>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="pr-3">
                            <ComponentsToolbar
                              include_components={[
                                {
                                  action: "search",
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
                            ></Panel>
                          </PanelGroup>
                          <div className="flex justify-center w-full">
                            <div className="w-1/5"></div>
                            <div className="w-3/5 pb-2 pt-2 flex gap-2">
                              {selectedRecords["issues"]?.length > 0 && (
                                <>
                                  <BulkOperationsToolbar
                                    include_components={[
                                      {
                                        action: "view",
                                        entity_type: "selected_records",
                                        type: "action",
                                        record: activeTask,
                                        onClick: bulkActionSelect,
                                      },
                                      {
                                        action: "bulk_update",
                                        entity_type: "selected_records",
                                        type: "action",
                                        record: activeTask,
                                        onClick: bulkActionSelect,
                                      },
                                      {
                                        action: "close",
                                        entity_type: "selected_records",
                                        type: "action",
                                        record: activeTask,
                                        onClick: bulkActionSelect,
                                      },
                                      {
                                        action: "assign",
                                        entity_type: "selected_records",
                                        type: "action",
                                        record: activeTask,
                                        onClick: bulkActionSelect,
                                      },
                                      {
                                        action: "delete",
                                        entity_type: "selected_records",
                                        type: "action",
                                        record: activeTask,
                                        onClick: bulkActionSelect,
                                      },
                                      {
                                        action: "custom_actions",
                                        entity_type: "selected_records",
                                        type: "action",
                                        record: activeTask,
                                        onClick: bulkActionSelect,
                                      },
                                    ]}
                                  ></BulkOperationsToolbar>
                                </>
                              )}
                            </div>
                            <div className="w-1/5"></div>
                          </div>

                          {activeTask ? (
                            <div className="w-full">
                              <ActionStepsWrapper
                                entity_type="action_steps"
                                record={activeTask}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-4">
                              <p className="text-sm text-gray-600 text-center">
                                Selected action step executions appear here.
                              </p>
                            </div>
                          )}
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
                style={{ height: "calc(100vh - 100px)" }}
              >
                <Accordion defaultValue={["action_input"]} multiple={true}>
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
                  {/* <Accordion.Item key="logs" value="logs">
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
                  </Accordion.Item> */}
                  <Accordion.Item key="plan" value="plan">
                    <Accordion.Control icon={<IconListTree size={16} />}>
                      Plan
                    </Accordion.Control>
                    <Accordion.Panel>
                      {activeTask ? (
                        <div className="w-full">
                          {" "}
                          <PlanWrapper
                            name="list items"
                            query_name="data_model"
                            record={activeTask}
                            action={"plan"}
                            success_message_code="action_input_data_model_schema"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-4">
                          <p className="text-sm text-gray-600 text-center">
                            Action plan appears here.
                          </p>
                        </div>
                      )}
                    </Accordion.Panel>
                  </Accordion.Item>
                  {action && !["save", "search"]?.includes(action) && (
                    <Accordion.Item key="action_input" value="action_input">
                      <Accordion.Control icon={<IconForms size={16} />}>
                        {action} action input
                      </Accordion.Control>
                      <Accordion.Panel>
                        {activeTask && (
                          <div className="w-full">
                            <ActionInputWrapper
                              name={action}
                              query_name="data_model"
                              record={activeTask}
                              action={action}
                              success_message_code="action_input_data_model_schema"
                            />
                          </div>
                        )}
                      </Accordion.Panel>
                    </Accordion.Item>
                  )}

                  {/* <Accordion.Item key="logs" value="logs">
                    <Accordion.Control icon={<IconListTree size={16} />}>
                      Action Input
                    </Accordion.Control>
                    <Accordion.Panel>
                      {activeTask ? (
                        <div className="w-full">
                          <ActionInputWrapper
                            execution_record={activeTask}
                            query_name="execution data model"
                            record={{
                              id: activeTask?.id,
                            }}
                            action={focused_entities["action_input"]?.action}
                            focused_item="action_input"
                            read_record_mode="local"
                            success_message_code="action_input_data_model_schema"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-4">
                          <p className="text-sm text-gray-600 text-center">
                            Prompts for your input required to successfully
                            complete an action will dynamically appear here.
                          </p>
                        </div>
                      )}
                    </Accordion.Panel>
                  </Accordion.Item> */}
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
