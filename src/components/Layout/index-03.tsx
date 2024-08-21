import ExecutionTrace from "@components/ExecutionTrace";
import GlobalVariables from "@components/GlobalVariables";
import Hero from "@components/Hero";
import MonacoEditor from "@components/MonacoEditor";
import NaturalLanguageQuery from "@components/NaturalLanguageQuery";
import QueryGraph from "@components/QueryGraph";
import RecommendationsGraph from "@components/RecommendationsGraph";
import StructuredQuery from "@components/StructuredQuery";
import {
  getComponentByKey,
  useAuthToken,
  useDomain,
  useFetchDomainDataByDomain,
} from "@components/Utils";
import {
  ComponentKey,
  IApplication,
  QueryDataType,
} from "@components/interfaces";
import { Accordion, Button, Tabs, Textarea, Text } from "@mantine/core";
import {
  Authenticated,
  HttpError,
  useGo,
  useIsAuthenticated,
  useOne,
  useParsed,
} from "@refinedev/core";
import {
  IconAffiliate,
  IconChalkboard,
  IconClipboard,
  IconComponents,
  IconFilter,
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
  IconUserPlus,
  IconWashTemperature4,
  IconWorld,
  IconBuilding,
  IconSettings,
  IconSettingsAutomation,
  IconEdit,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import ActionControl from "pages/action_control/create";
import React, { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppLayout } from "src/components/Layout/AppLayout";
import { useAppStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";
import PageSection from "@components/PageSection";
import StateView from "@components/StateView";
import ActionInput, { ActionInputWrapper } from "@components/ActionInput";
import Recommendations, {
  RecommendationsWrapper,
} from "@components/Recommendations";
import GenerativeComponentWrapper from "@components/GenerativeComponent";
import ActivateActionsSelection from "@components/ActivateActionsSelection";
import SelectAction from "@components/SelectAction";
import SearchComponent from "@components/Search";
import ActionSteps from "@components/ActionSteps";
import { ActionControlFormWrapper } from "@components/ActionControlForm";

const useFullUrl = () => {
  const router = useRouter();
  const [fullUrl, setFullUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Combines the origin with the asPath for full URL
      const fullUrl = window.location.origin + router.asPath;
      setFullUrl(fullUrl);
    }
  }, [router.asPath]);

  return fullUrl;
};

function InitializeApplication({
  activeApplicationId,
  children,
}: {
  activeApplicationId?: string;
  children: React.ReactNode;
}) {
  const domain = useDomain();

  // get session from params
  // const {
  //   data: domainData,
  //   isLoading: domainDataIsLoading,
  //   error: domainDataError,
  // } = useFetchDomainDataByDomain(domain);
  // const { setActiveApplication, activeApplication } = useAppStore();
  // const currentUrl = window.location.href;
  // const { params, resource, pathname } = useParsed();
  // const {
  //   data: applicationData,
  //   isLoading: isLoadingApplication,
  //   isError: isErrorApplication,
  // } = useOne<IApplication, HttpError>({
  //   resource: "applications",
  //   id: `${activeApplication?.id || activeApplicationId}`,
  // }); // if no active application provide the id of catchmytask as the default application to load

  // console.log("pathname", pathname, resource, params);
  // console.log("currentUrl", currentUrl);
  // console.log("domain", domain);

  // console.log(
  //   "initialize application",
  //   applicationData?.data,
  //   activeApplicationId,
  //   activeApplication?.id,
  //   isLoadingApplication,
  //   isErrorApplication
  // );
  // const application = applicationData?.data;
  // useEffect(() => {
  //   if (application) {
  //     setActiveApplication(application);
  //   }
  // }, [applicationData?.data]);
  // if (isLoadingApplication) {
  //   return <>Loading...</> || null;
  // }
  // if (isErrorApplication) {
  //   return <>{JSON.stringify(isErrorApplication)}</>;
  // }
  // if (domainDataIsLoading) {
  //   return <>Loading...</> || null;
  // }
  // if (domainDataError) {
  //   return <>{JSON.stringify(domainDataError)}</>;
  // }
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
  } = useAppStore();
  const go = useGo();
  const parsed = useParsed();
  const domain = useDomain();
  const {
    data: domainData,
    isLoading: domainDataIsLoading,
    error: domainDataError,
  } = useFetchDomainDataByDomain(domain);
  // return (
  //   <div>
  //     {JSON.stringify(
  //       domainData?.data?.find(
  //         (item: any) => item?.message?.code === "query_success_results"
  //       )
  //     )}
  //   </div>
  // );

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
    return (
      <>
        {/* <div>is not authenticated / page</div> */}
        <AppLayout authenticatedData={authenticatedData}>
          {/* <div>not authenticated / page : make request with guest credentials</div> */}
          <InitializeApplication>
            <>
              {domainData?.data[0]?.find(
                (item: any) => item?.message === "Query successfully executed"
              ).results[0]["result"][0]["domain"]["metadata"][
                "visible_sections"
              ] &&
                domainData?.data[0]
                  ?.find(
                    (item: any) =>
                      item?.message === "Query successfully executed"
                  )
                  .results[0]["result"][0]["domain"]["metadata"][
                    "visible_sections"
                  ].map((section: string) => {
                    const Component = getComponentByKey(
                      section as ComponentKey
                    );
                    // return <div>{Component}</div>;
                    return (
                      <Component
                        title={domainData?.data[0]
                          ?.find(
                            (item: any) =>
                              item?.message === "Query successfully executed"
                          )
                          .results[0]["result"][0]["application"][
                            "titles"
                          ].find(
                            (title: any) => title["type"] === `${section}_title`
                          )}
                        items={
                          domainData?.data[0]?.find(
                            (item: any) =>
                              item?.message === "Query successfully executed"
                          ).results[0]["result"][0]["application"][section]
                        }
                        // items={domainData?.data[0]?.[section]}
                        entity_type={section}
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

  return (
    <Authenticated key="home" redirectOnFail="/login">
      <AppLayout authenticatedData={authenticatedData}>
        <SelectAction></SelectAction>
        {sessionConfig?.background_execution && (
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
                  <NaturalLanguageQuery />
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

        {!sessionConfig?.background_execution && (
          <PanelGroup direction="horizontal">
            {activeLayout?.leftSection?.isDisplayed && (
              <Panel defaultSize={20} minSize={0} id="left">
                <div
                  className="overflow-auto h-screen"
                  style={{ height: "calc(100vh - 64px)" }}
                >
                  <Accordion
                    defaultValue={[
                      "services",
                      "search_tasks",
                      "search_action_steps",
                      "results",
                    ]}
                    multiple={true}
                  >
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
                        {/* <SearchComponent entity="tasks"></SearchComponent> */}
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
                        {/* <div className="flex items-center justify-center p-4">
                        <p className="text-sm text-gray-600 text-center">
                          Tasks you can leverage
                        </p>
                      </div> */}
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
                    {/* <Accordion.Item
                    key="global_variables"
                    value="global_variables"
                  >
                    <Accordion.Control icon={<IconWorld size={16} />}>
                      Global Variables
                    </Accordion.Control>
                    <Accordion.Panel>
                      
                      <MonacoEditor
                        value={{
                          application: {
                            id: activeApplication?.id,
                            name: activeApplication?.name,
                          },
                          session: {
                            id: activeSession?.id,
                            name: activeSession?.name,
                          },
                        }}
                        language="json"
                      />
                    </Accordion.Panel>
                  </Accordion.Item> */}
                    {/* <Accordion.Item key="task_variables" value="task_variables">
                    <Accordion.Control icon={<IconFilter size={16} />}>
                      Task Variables
                    </Accordion.Control>
                    <Accordion.Panel>
                     
                      <MonacoEditor
                        value={{}}
                        language="json"
                      />
                    </Accordion.Panel>
                  </Accordion.Item> */}

                    {/* <Accordion.Item
                    key="structured_query"
                    value="structured_query"
                  >
                    <Accordion.Control icon={<IconSql size={16} />}>
                      Structured Query
                    </Accordion.Control>
                    <Accordion.Panel>
                      <StructuredQuery />
                    </Accordion.Panel>
                  </Accordion.Item> */}
                    {/* <Accordion.Item key="query_graph" value="query_graph">
                    <Accordion.Control icon={<IconAffiliate size={16} />}>
                      Query Graph
                    </Accordion.Control>
                    <Accordion.Panel>
                      <QueryGraph />
                    </Accordion.Panel>
                  </Accordion.Item> */}
                    {/* <Accordion.Item key="execution_trace" value="execution_trace">
                    <Accordion.Control icon={<IconListCheck size={16} />}>
                      Execution Trace
                    </Accordion.Control>
                    <Accordion.Panel>
                      <ExecutionTrace></ExecutionTrace>
                    </Accordion.Panel>
                  </Accordion.Item> */}
                    {/* <Accordion.Item
                    key="recommendations_window"
                    value="recommendations_window"
                  >
                    <Accordion.Control icon={<IconUserPlus size={16} />}>
                      Search Recommendations
                    </Accordion.Control>
                    <Accordion.Panel>
                      <RecommendationsWrapper></RecommendationsWrapper>
                    </Accordion.Panel>
                  </Accordion.Item> */}
                    {/* <Accordion.Item key="shortcut" value="shortcut">
                    <Accordion.Control icon={<IconAffiliate size={16} />}>
                      Shortcuts
                    </Accordion.Control>
                    <Accordion.Panel>
                      <ShortcutList />
                    </Accordion.Panel>
                  </Accordion.Item> */}
                    {/* <Accordion.Item key="sessions" value="sessions">
                    <Accordion.Control icon={<IconComponents size={16} />}>
                      Sessions
                    </Accordion.Control>
                    <Accordion.Panel>
                      <SessionList />
                    </Accordion.Panel>
                  </Accordion.Item> */}
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
                    {/* <div className="flex-grow">{children}</div> */}
                    {/* <ActivateActionsSelection
                    record={{}}
                    resultsSection={{
                      name: "natural_language_query_indicator",
                    }}
                  ></ActivateActionsSelection> */}
                    <Accordion
                      defaultValue={["natural_language_query", "action_plan"]}
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
                          <NaturalLanguageQuery />
                        </Accordion.Panel>
                      </Accordion.Item>
                      {/* <Accordion.Item
                      key="well_defined_task"
                      value="well_defined_task"
                    >
                      <Accordion.Control icon={<IconLanguage size={16} />}>
                        Well Defined Task
                      </Accordion.Control>
                      <Accordion.Panel>
                        <NaturalLanguageQuery />
                      </Accordion.Panel>
                    </Accordion.Item> */}
                      <Accordion.Item key="action_plan" value="action_plan">
                        <Accordion.Control icon={<IconLanguage size={16} />}>
                          Action Plan
                        </Accordion.Control>
                        <Accordion.Panel>
                          {/* <div>
                          editable action steps inserted after selection or
                          generation or both with ability to refine
                        </div> */}
                          <ActionSteps
                            entity="action_steps"
                            ui={{ rowExpansionTrigger: "always" }}
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
                    <Accordion
                      defaultValue={["action_input", "smart_indicators"]}
                      multiple={true}
                    >
                      {/* <Accordion.Item
                      key="natural_language_query_indicator"
                      value="natural_language_query_indicator"
                    >
                      <Accordion.Control icon={<IconGauge size={16} />}>
                        Natural Language Query Indicator
                      </Accordion.Control>
                      <Accordion.Panel>
                        <GenerativeComponentWrapper
                          type="reviews"
                          response_model="ReviewForTaskDescription"
                          instruction="generate review for task description"
                          object_to_list_of_records_with_uuid={true}
                          name="ReviewForTaskDescription"
                        ></GenerativeComponentWrapper>
                      </Accordion.Panel>
                    </Accordion.Item> */}
                      <Accordion.Item key="action_input" value="action_input">
                        <Accordion.Control icon={<IconForms size={16} />}>
                          Action Input
                        </Accordion.Control>
                        <Accordion.Panel>
                          {/* <div className="flex items-center justify-center p-4">
                          <p className="text-sm text-gray-600 text-center">
                            Smart dynamically changing form will automatically
                            appear here given cursor position and input
                          </p>
                        </div> */}
                          {activeRecord && (
                            <ActionControlFormWrapper
                              record={activeRecord}
                              action_type="write"
                              entity="action_step"
                            ></ActionControlFormWrapper>
                          )}
                        </Accordion.Panel>
                      </Accordion.Item>

                      {/* <Accordion.Item
                      key="smart_indicators"
                      value="smart_indicators"
                    >
                      <Accordion.Control icon={<IconGauge size={16} />}>
                        Smart Indicators
                      </Accordion.Control>
                      <Accordion.Panel>
                        <div className="flex items-center justify-center p-4">
                          <p className="text-sm text-gray-600 text-center">
                            Smart dynamically changing indicators will appear
                            here given cursor position and input
                          </p>
                        </div>
                        <GenerativeComponentWrapper
                          type="reviews"
                          response_model="ReviewForTaskDescription"
                          instruction="generate review for task description"
                          object_to_list_of_records_with_uuid={true}
                          name="ReviewForTaskDescription"
                        ></GenerativeComponentWrapper>
                      </Accordion.Panel>
                    </Accordion.Item> */}
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
