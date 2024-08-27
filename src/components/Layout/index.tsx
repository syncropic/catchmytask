import NaturalLanguageQuery from "@components/NaturalLanguageQuery";
import {
  getComponentByKey,
  useAuthToken,
  useFetchDomainDataByDomain,
} from "@components/Utils";
import { ComponentKey } from "@components/interfaces";
import { Accordion, Button, Tabs, Textarea, Text, Slider } from "@mantine/core";
import {
  Authenticated,
  HttpError,
  useGo,
  useIsAuthenticated,
  useOne,
  useParsed,
} from "@refinedev/core";
import {
  IconForms,
  IconGauge,
  IconLanguage,
  IconListCheck,
  IconListDetails,
  IconListSearch,
  IconMathFunction,
  IconSql,
  IconStackBack,
  IconTableShortcut,
  IconTools,
  IconBuilding,
  IconSettings,
  IconSettingsAutomation,
  IconEdit,
  IconSearch,
  IconVariable,
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
  const { token, loading, error } = useAuthToken();
  const {
    activeLayout,
    setActiveApplication,
    activeSession,
    activeApplication,
    sessionConfig,
    activeRecord,
    global_variables,
    setGlobalVariables,
  } = useAppStore();
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

  useEffect(() => {
    if (domainRecord?.["application"]) {
      setActiveApplication(domainRecord?.["application"]);
    }
  }, [domainRecord]);

  if (isLoading || domainDataIsLoading) {
    return <>Loading...</> || null;
  }
  // error handling
  if (error || domainDataError) {
    return (
      <>
        {JSON.stringify(error)} {JSON.stringify(domainDataError)}
      </>
    );
  }

  // if not authenticated and url is not /login
  if (!authenticatedData?.authenticated && parsed?.pathname == "/login") {
    // show login form and auth providers
    return <>{children}</>;
  }

  // const Component = getComponentByResourceType(
  //   field?.display_component as ComponentKey
  // );
  // for homepage if not logged authenticated
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
        {/* <div>is not authenticated / page</div> */}
        <AppLayout authenticatedData={authenticatedData}>
          {/* <div>not authenticated / page : make request with guest credentials</div> */}
          <InitializeApplication>
            <>
              {/* <div>
                {JSON.stringify(
                  domain_data["domain"]["metadata"]["visible_sections"]
                )}
              </div> */}
              {visible_sections &&
                visible_sections.map((section: string) => {
                  const Component = getComponentByKey(section as ComponentKey);
                  return (
                    // <div>{section}</div>
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
  // show login button if not authenticated
  if (!authenticatedData?.authenticated && parsed?.pathname !== "/login") {
    return (
      <>
        {/* <div>is not authenticated and not /login page (show signin form and auth providers)</div> . later show specific non-authenticated pages such as about*/}
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
  // const marks = [
  //   { value: 0, label: "off" },
  //   { value: 25, label: "refine task" },
  //   { value: 50, label: "suggest " },
  //   { value: 75, label: "lg" },
  //   { value: 100, label: "xl" },
  // ];

  return (
    <Authenticated key="home" redirectOnFail="/login">
      <AppLayout authenticatedData={authenticatedData}>
        <SelectAction></SelectAction>
        {sessionConfig?.interaction_mode == "search" && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Accordion
              defaultValue={["natural_language_query", "search_results"]}
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
                  ></ActionInputWrapper>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item key="search_results" value="search_results">
                <Accordion.Control icon={<IconSearch size={16} />}>
                  Results
                </Accordion.Control>
                <Accordion.Panel>
                  <Tabs defaultValue="basic" orientation="vertical">
                    <Tabs.List>
                      <Tabs.Tab value="basic">Basic</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic">
                      {/* <div className="flex items-center justify-center p-4">
                        <p className="text-sm text-gray-600 text-center">
                          Search results will appear here
                        </p>
                      </div> */}
                      <ActionSteps
                        entity="action_steps"
                        ui={{ rowExpansionTrigger: "always" }}
                      />
                    </Tabs.Panel>
                  </Tabs>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>
        )}
        {sessionConfig?.interaction_mode == "background" && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                  {/* <NaturalLanguageQuery /> */}
                  <ActionInputWrapper
                    name="task"
                    query_name="data_model"
                  ></ActionInputWrapper>
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item key="session_config" value="session_config">
                <Accordion.Control icon={<IconSettings size={16} />}>
                  Session Config
                </Accordion.Control>
                <Accordion.Panel>
                  <Tabs defaultValue="basic" orientation="vertical">
                    <Tabs.List>
                      <Tabs.Tab value="create">Basic</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic">
                      <div className="p-3">
                        <ActionInputWrapper
                          name="session_config"
                          query_name="data_model"
                        ></ActionInputWrapper>
                      </div>
                    </Tabs.Panel>
                  </Tabs>
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item key="automation_config" value="automation_config">
                <Accordion.Control icon={<IconSettingsAutomation size={16} />}>
                  Automation Config
                </Accordion.Control>
                <Accordion.Panel>
                  <Tabs defaultValue="basic" orientation="vertical">
                    <Tabs.List>
                      <Tabs.Tab value="create">Basic</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="basic">
                      <div className="p-3">
                        <ActionInputWrapper
                          name="automation_config"
                          query_name="data_model"
                        ></ActionInputWrapper>
                      </div>
                    </Tabs.Panel>
                  </Tabs>
                </Accordion.Panel>
              </Accordion.Item>
              <div className="flex m-3 justify-end">
                <Button>Catch</Button>
              </div>
            </Accordion>
          </div>
        )}

        {["interactive", "any"]?.includes(sessionConfig?.interaction_mode) && (
          <PanelGroup direction="horizontal">
            {activeLayout?.leftSection?.isDisplayed && (
              <Panel defaultSize={20} minSize={0} id="left">
                <div
                  className="overflow-auto h-screen"
                  style={{ height: "calc(100vh - 64px)" }}
                >
                  <Accordion defaultValue={[]} multiple={true}>
                    <Accordion.Item key="state_view" value="state_view">
                      <Accordion.Control icon={<IconStackBack size={16} />}>
                        Session Summary {`: `}
                        <Text component="span" fw={700}>
                          {activeSession?.internal_id}
                        </Text>
                      </Accordion.Control>
                      <Accordion.Panel>
                        <StateView></StateView>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item key="services" value="services">
                      <Accordion.Control icon={<IconBuilding size={16} />}>
                        Services
                      </Accordion.Control>
                      <Accordion.Panel>
                        <div className="flex items-center justify-center p-4">
                          <p className="text-sm text-gray-600 text-center">
                            Services you can leverage
                          </p>
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item key="search_tasks" value="search_tasks">
                      <Accordion.Control icon={<IconTools size={16} />}>
                        Tasks
                      </Accordion.Control>
                      <Accordion.Panel>
                        <SearchComponent entity="tasks"></SearchComponent>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item
                      key="search_action_steps"
                      value="search_action_steps"
                    >
                      <Accordion.Control icon={<IconListDetails size={16} />}>
                        Action Steps
                      </Accordion.Control>
                      <Accordion.Panel>
                        {/* <SearchComponent entity="action_steps"></SearchComponent> */}
                        <div className="flex items-center justify-center p-4">
                          <p className="text-sm text-gray-600 text-center">
                            Action steps you can leverage
                          </p>
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                    <Accordion.Item key="results" value="results">
                      <Accordion.Control icon={<IconListDetails size={16} />}>
                        Results
                      </Accordion.Control>
                      <Accordion.Panel>
                        {/* <SearchComponent entity="action_steps"></SearchComponent> */}
                        <div className="flex items-center justify-center p-4">
                          <p className="text-sm text-gray-600 text-center">
                            Results you can leverage
                          </p>
                        </div>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                </div>
              </Panel>
            )}
            {activeLayout?.centerSection?.isDisplayed && (
              <>
                <PanelResizeHandle className="w-1 bg-gray-500" id="left" />
                <Panel defaultSize={60} minSize={30} id="middle">
                  <div
                    className="flex flex-col h-screen overflow-auto"
                    style={{
                      height: "calc(100vh - 64px)",
                      paddingBottom: "60px",
                    }}
                  >
                    <Accordion
                      defaultValue={[
                        "natural_language_query",
                        "action_plan",
                        "task_input",
                      ]}
                      multiple={true}
                      // className="mt-auto"
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
                            exclude_components={["input_mode", "submit_button"]}
                            success_message_code="action_input_data_model_schema"
                            update_action_input_form_values_on_submit_success={
                              true
                            }
                            nested_component={{
                              data_model: {
                                name: "task_config",
                              },
                            }}
                          >
                            <ActionInputWrapper
                              name="task_config"
                              query_name="data_model"
                              success_message_code="action_input_data_model_schema"
                              exclude_components={[
                                "input_mode",
                                "submit_button",
                              ]}
                            ></ActionInputWrapper>
                          </ActionInputWrapper>
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item key="task_input" value="task_input">
                        <Accordion.Control icon={<IconForms size={16} />}>
                          Task Input
                        </Accordion.Control>
                        <Accordion.Panel>
                          <TaskInputWrapper
                            name="task_input"
                            exclude_components={["input_mode", "submit_button"]}
                            success_message_code="task_input_data"
                            description={
                              <div className="flex items-center justify-center p-4">
                                <p className="text-sm text-gray-600 text-center">
                                  Prompt for your input required to customize
                                  and successfully complete a task will appear
                                  here.
                                </p>
                              </div>
                            }
                          ></TaskInputWrapper>
                        </Accordion.Panel>
                      </Accordion.Item>

                      <Accordion.Item key="action_plan" value="action_plan">
                        <Accordion.Control icon={<IconListDetails size={16} />}>
                          Action Plan
                        </Accordion.Control>
                        <Accordion.Panel>
                          {/* <div>
                          editable action steps inserted after selection or
                          generation or both with ability to refine
                        </div> */}
                          <ActionStepsWrapper
                            entity="action_steps"
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
                </Panel>
              </>
            )}
            {activeLayout?.rightSection?.isDisplayed && (
              <>
                <PanelResizeHandle className="w-1 bg-gray-500" id="middle" />
                <Panel defaultSize={20} minSize={0} id="right">
                  <div
                    className="overflow-auto h-screen"
                    style={{ height: "calc(100vh - 64px)" }}
                  >
                    <Accordion defaultValue={["action_input"]} multiple={true}>
                      <Accordion.Item
                        key="global_variables"
                        value="global_variables"
                      >
                        <Accordion.Control icon={<IconVariable size={16} />}>
                          Global Variables
                        </Accordion.Control>
                        <Accordion.Panel>
                          {/* <div>
                            global variables synced to active action input
                          </div> */}
                          <MonacoEditor
                            // {...props?.schema}
                            value={global_variables}
                            setValue={setGlobalVariables}
                            // field={props?.schema.title
                            //   .toLowerCase()
                            //   .replace(/ /g, "_")}
                            // {...props}
                          />
                          {/* {activeRecord && (
                            <ActionControlFormWrapper
                              record={activeRecord}
                              action_type="write"
                              entity="action_step"
                            ></ActionControlFormWrapper>
                          )} */}
                          {/* {["any"]?.includes(
                            sessionConfig?.interaction_mode
                          ) && (
                            <ActionInputWrapper
                              name="action_step_any"
                              query_name="data_model"
                            ></ActionInputWrapper>
                          )} */}
                        </Accordion.Panel>
                      </Accordion.Item>

                      <Accordion.Item key="action_input" value="action_input">
                        <Accordion.Control icon={<IconForms size={16} />}>
                          Action Input
                        </Accordion.Control>
                        <Accordion.Panel>
                          {/* {activeRecord && (
                            <ActionControlFormWrapper
                              record={activeRecord}
                              action_type="write"
                              entity="action_step"
                            ></ActionControlFormWrapper>
                          )} */}
                          {["any"]?.includes(
                            sessionConfig?.interaction_mode
                          ) && (
                            <ActionInputWrapper
                              name="action_step"
                              query_name="data_model"
                            ></ActionInputWrapper>
                          )}
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        )}
      </AppLayout>
    </Authenticated>
  );
};

export default Layout;
