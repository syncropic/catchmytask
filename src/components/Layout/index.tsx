import NaturalLanguageQuery from "@components/NaturalLanguageQuery";
import {
  getComponentByKey,
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
import { useAppStore } from "src/store";
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
    setActiveApplication,
    activeSession,
    activeTask,
    activeSections,
    setActiveSections,
    sessionConfig,
    colorScheme,
  } = useAppStore();
  const computedColorScheme = useComputedColorScheme("light"); // Compute the color scheme, defaults to 'light'
  // Define a media query for large screens
  const isLargeScreen = useMediaQuery("(min-width: 1024px)");

  // Determine whether the panel should be displayed
  const shouldDisplayLeftSection =
    activeLayout?.leftSection?.isDisplayed && isLargeScreen;
  const shouldDisplayRightSection =
    activeLayout?.rightSection?.isDisplayed && isLargeScreen;

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
                      {/* <SearchInput include_action_icons={["filter"]} /> */}
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
                    defaultValue={[
                      "natural_language_query",
                      "action_plan",
                      "action_input",
                    ]}
                    multiple={true}
                  >
                    <Accordion.Item
                      key="natural_language_query"
                      value="natural_language_query"
                    >
                      <Accordion.Control icon={<IconLetterQ size={16} />}>
                        <div className="flex justify-between items-center pr-8">
                          <div>Query</div>

                          <ComponentsToolbar
                            include_components={[
                              {
                                action: "pin",
                                entity_type: "query",
                                onClick: toggleSectionPinned,
                              },
                              {
                                action: "remove",
                                entity_type: "query",
                                onClick: () => {},
                              },
                              {
                                action: "configure",
                                entity_type: "query",
                                onClick: () => {},
                              },
                            ]}
                          ></ComponentsToolbar>
                        </div>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <ActionInputWrapper
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
                          {/* <ActionInputWrapper
                          name="task_config"
                          query_name="data_model"
                          success_message_code="action_input_data_model_schema"
                          exclude_components={["input_mode", "submit_button"]}
                        ></ActionInputWrapper> */}
                        </ActionInputWrapper>
                      </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item key="action_input" value="action_input">
                      <Accordion.Control icon={<IconForms size={16} />}>
                        <div className="flex justify-between items-center pr-8">
                          <div>Action Input</div>

                          <ComponentsToolbar
                            include_components={[
                              {
                                action: "pin",
                                entity_type: "action_input",
                                onClick: toggleSectionPinned,
                              },
                              {
                                action: "remove",
                                entity_type: "action_input",
                                onClick: () => {},
                              },
                              {
                                action: "configure",
                                entity_type: "action_input",
                                onClick: () => {},
                              },
                            ]}
                          ></ComponentsToolbar>
                        </div>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <div className="flex items-center justify-center p-4">
                          <p className="text-sm text-gray-600 text-center">
                            Prompts for your input required to customize and/or
                            successfully complete a task/action will appear
                            here.
                          </p>
                        </div>
                        {/* <TaskInputWrapper
                          name="task_input"
                          exclude_components={["input_mode", "submit_button"]}
                          success_message_code="task_input_data"
                          description={
                            <div className="flex items-center justify-center p-4">
                              <p className="text-sm text-gray-600 text-center">
                                Prompts for your input required to customize and/or
                                successfully complete a task/action will appear here.
                              </p>
                            </div>
                          }
                        ></TaskInputWrapper> */}
                      </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item key="action_plan" value="action_plan">
                      <Accordion.Control icon={<IconListDetails size={16} />}>
                        <div className="flex justify-between items-center pr-8">
                          <div>Action Plan</div>
                          {/* <Automation /> */}
                          <ComponentsToolbar
                            include_components={[
                              {
                                action: "pin",
                                entity_type: "action_plan",
                                onClick: toggleSectionPinned,
                              },
                              {
                                action: "remove",
                                entity_type: "action_plan",
                                onClick: () => {},
                              },
                              {
                                action: "configure",
                                entity_type: "action_plan",
                                onClick: () => {},
                              },
                              {
                                action: "automate",
                                entity_type: "action_plan",
                                onClick: () => {},
                              },
                            ]}
                          ></ComponentsToolbar>
                        </div>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <ActionStepsWrapper
                          entity="action_steps"
                          record={activeTask}
                          ui={{ rowExpansionTrigger: "always" }}
                          nested_item="action_steps"
                          exclude_components={[
                            "input_mode",
                            "submit_button",
                            "columns",
                            "custom_views",
                            "save",
                            "live_updates",
                            "follow_up",
                            "execute_selected",
                          ]}
                          success_message_code="action_plan"
                        />
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
