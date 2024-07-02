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
  useFetchDomainDataByDomain,
} from "@components/Utils";
import {
  ComponentKey,
  IApplication,
  QueryDataType,
} from "@components/interfaces";
import { Accordion, Button, Textarea } from "@mantine/core";
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
  IconComponents,
  IconFilter,
  IconLanguage,
  IconListCheck,
  IconListSearch,
  IconSql,
  IconTableShortcut,
  IconUserPlus,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import ActionControl from "pages/action_control/create";
import React, { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { AppLayout } from "src/components/Layout/AppLayout";
import { useAppStore } from "src/store";
import { useQueryClient } from "@tanstack/react-query";
import PageSection from "@components/PageSection";

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

const useDomain = () => {
  const [domain, setDomain] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // This includes the protocol and domain up to the extension
      setDomain(window.location.origin);
    }
  }, []);

  return domain;
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
  const { isLoading, data } = useIsAuthenticated();
  const { token, loading, error } = useAuthToken();
  const go = useGo();
  const parsed = useParsed();
  const { activeLayout, activeApplication } = useAppStore();
  const queryClient = useQueryClient();
  const domain = useDomain();
  // const domainData = queryClient.getQueryData<QueryDataType>([
  //   `useFetchDomainDataByDomain_${domain}`,
  // ]);
  const {
    data: domainData,
    isLoading: domainDataIsLoading,
    error: domainDataError,
  } = useFetchDomainDataByDomain(domain);

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
  if (!data?.authenticated && parsed?.pathname == "/login") {
    // show login form and auth providers
    return <>{children}</>;
  }

  // const Component = getComponentByResourceType(
  //   field?.display_component as ComponentKey
  // );
  // for homepage if not logged authenticated
  if (!data?.authenticated && parsed?.pathname == "/") {
    return (
      <>
        {/* <div>is not authenticated / page</div> */}
        <AppLayout>
          {/* <div>not authenticated / page : make request with guest credentials</div> */}
          <InitializeApplication>
            {/* {JSON.stringify(domainData?.data[0]?.visible_sections)} */}
            <>
              {domainData?.data[0]?.visible_sections &&
                domainData?.data[0]?.visible_sections.map((section: string) => {
                  const Component = getComponentByKey(section as ComponentKey);
                  // return <div>{Component}</div>;
                  return (
                    <Component
                      title={domainData?.data[0]}
                      items={domainData?.data[0]?.[section]}
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
  if (!data?.authenticated && parsed?.pathname !== "/login") {
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
      <AppLayout>
        <PanelGroup direction="horizontal">
          {activeLayout?.leftSection?.isDisplayed && (
            <Panel defaultSize={20} minSize={0} id="left">
              <div
                className="overflow-auto h-screen"
                style={{ height: "calc(100vh - 64px)" }}
              >
                <Accordion
                  defaultValue={["natural_language_query", "execution_trace"]}
                  multiple={true}
                >
                  <Accordion.Item key="global_filters" value="global_filters">
                    <Accordion.Control icon={<IconFilter size={16} />}>
                      Global Filters
                    </Accordion.Control>
                    <Accordion.Panel>
                      {/* <div>
                        global variables from individual views are pushed to global //
                        configure // quick reset
                      </div> */}
                      <GlobalVariables />
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item
                    key="natural_language_query"
                    value="natural_language_query"
                  >
                    <Accordion.Control icon={<IconLanguage size={16} />}>
                      Natural Language Query
                    </Accordion.Control>
                    <Accordion.Panel>
                      <NaturalLanguageQuery></NaturalLanguageQuery>
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item
                    key="structured_query"
                    value="structured_query"
                  >
                    <Accordion.Control icon={<IconSql size={16} />}>
                      Structured Query
                    </Accordion.Control>
                    <Accordion.Panel>
                      {/* <div
                        className="overflow-auto h-screen"
                        style={{ height: "calc(100vh - 64px)" }}
                      >
                        <QueryControl />
                      </div> */}
                      <StructuredQuery />
                      {/* <div>
                        Manually written or AI generated structured query that
                        is resolved by the orchestration engine and the user
                        interface engine.
                      </div> */}
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item key="query_graph" value="query_graph">
                    <Accordion.Control icon={<IconAffiliate size={16} />}>
                      Query Graph
                    </Accordion.Control>
                    <Accordion.Panel>
                      <QueryGraph />
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item key="execution_trace" value="execution_trace">
                    <Accordion.Control icon={<IconListCheck size={16} />}>
                      Execution Trace
                    </Accordion.Control>
                    <Accordion.Panel>
                      <ExecutionTrace></ExecutionTrace>
                    </Accordion.Panel>
                  </Accordion.Item>
                  <Accordion.Item
                    key="recommendations_graph"
                    value="recommendations_graph"
                  >
                    <Accordion.Control icon={<IconUserPlus size={16} />}>
                      Recommendations Graph
                    </Accordion.Control>
                    <Accordion.Panel>
                      {/* <RecommendationsGraph></RecommendationsGraph> */}
                    </Accordion.Panel>
                  </Accordion.Item>
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
                  className="overflow-auto h-screen"
                  style={{ height: "calc(100vh - 64px)" }}
                >
                  {children}
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
                  <ActionControl />
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </AppLayout>
    </Authenticated>
  );
};

export default Layout;
