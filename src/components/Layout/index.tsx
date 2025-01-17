import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Authenticated,
  useGo,
  useIsAuthenticated,
  useParse,
  useParsed,
} from "@refinedev/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ResizeHandle from "@components/ResizeHandle";
import { useDomainData } from "@components/Utils/useDomainData";
import { useSessionAndTask } from "@components/Utils/useSessionAndTask";
import AccordionComponent from "@components/AccordionComponent";
import Breadcrumbs from "@components/Breadcrumbs";
import AppLayout from "./AppLayout";
import { useAppStore } from "src/store"; // Zustand store
import { useSession } from "next-auth/react";
import {
  useComputedColorScheme,
  Highlight,
  Button,
  Tooltip,
  ActionIcon,
  Accordion,
} from "@mantine/core";

import {
  getComponentByKey,
  useBulkActionSelect,
  useIsMobile,
} from "@components/Utils";
import InitializeApplication from "@components/Utils/InitializeApplication";
import { ComponentKey } from "@components/interfaces";
import MonacoEditor from "@components/MonacoEditor";
import ActionStepsWrapper from "@components/ActionSteps";
import BulkOperationsToolbar from "@components/BulkOperationsToolbar";
import { UploadedWrapper } from "@components/Uploaded";
import { activityActionAccordionConfig } from "./activityActionAccordionConfig";
import { viewQueryActionAccordionConfig } from "./viewQueryActionAccordionConfig";
import SessionsWrapper from "@components/Sessions";
import ExternalSubmitButton from "@components/SubmitButton";
import ActionInputWrapper from "@components/ActionInput";
import MonitorWrapper from "@components/Monitor";
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconMaximize,
  IconSquareX,
} from "@tabler/icons-react";
import DynamicFilter from "@components/DynamicFilter";
import ActionToolbar from "@components/ActionToolbar";

const Layout = ({
  children,
  noAuth,
}: {
  children: React.ReactNode;
  noAuth?: boolean;
}) => {
  const {
    domainData,
    isLoading: isLoadingDomainData,
    error: domainDataError,
    domainRecord,
  } = useDomainData();

  const {
    isLoading: isLoadingAuthenticatedData,
    data: authenticatedData,
    error: errorAuthenticatedData,
  } = useIsAuthenticated();
  const isMobile = useIsMobile(); // Custom hook to check if the screen is mobile

  const {
    activeLayout,
    colorScheme,
    pinned_main_action,
    activeTask,
    activeSession,
    focused_entities,
    selectedRecords,
    activeView,
    activeProfile,
    clearViews,
    views,
    showRequestResponseView,
    activeInput,
    setActiveInput,
    setActiveLayout,
    sectionIsExpanded,
    setSectionIsExpanded,
  } = useAppStore(); // Accessing layout state from Zustand
  const { bulkActionSelect } = useBulkActionSelect();
  const { data: user_session } = useSession();

  const { params } = useParsed();

  const { leftSection, centerSection, rightSection } = activeLayout; // Destructure the sections for visibility checks

  const computedColorScheme = useComputedColorScheme("light"); // Default to light theme if auto is selected
  const effectiveScheme =
    colorScheme.scheme === "auto" ? computedColorScheme : colorScheme.scheme;

  useSessionAndTask(domainRecord);
  const go = useGo(); // Navigation function
  const parsed = useParsed(); // Parsed pathname from useParsed hook

  let action = focused_entities[activeTask?.id]?.["action"];

  // Refs for the mobile horizontal scrolling sections
  const leftRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  // State for managing scroll hint visibility
  const [showScrollHint, setShowScrollHint] = useState(true);

  const scrollToSection = (section: "left" | "center" | "right") => {
    if (section === "left" && leftRef.current) {
      leftRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (section === "center" && centerRef.current) {
      centerRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (section === "right" && rightRef.current) {
      rightRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Automatically hide the scroll hint after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollHint(false);
    }, 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  // Redirect and render logic based on the user's authentication status and path
  if (isLoadingAuthenticatedData || isLoadingDomainData) {
    return <>Loading...</> || null;
  }

  if (domainDataError) {
    return (
      <MonacoEditor
        value={{
          data: domainDataError?.response?.data,
          status: domainDataError?.response?.status,
        }}
        language="json"
        height="75vh"
      />
    );
  }

  if (!authenticatedData?.authenticated && parsed?.pathname === "/login") {
    return <>{children}</>;
  }

  if (!authenticatedData?.authenticated && parsed?.pathname === "/") {
    const domain_data =
      domainData?.data?.find(
        (item: any) => item?.message?.code === "fetch_system_domain_data"
      )?.data?.[0] || {};

    const visible_sections =
      domain_data?.domain?.metadata?.visible_sections || null;
    const application = domain_data?.application || null;

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
                      title={
                        application?.titles?.length > 1
                          ? application["titles"]?.find(
                              (title: any) =>
                                title["metadata"]["section"] === `${section}`
                            )
                          : ""
                      }
                      items={application[section] || []}
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

  // Return the authenticated layout with your existing logic
  let select_or_create_to_continue_items = [
    activeSession,
    activeTask,
    activeView,
  ];
  let select_or_create_to_continue_items_map = ["session", "task", "view"];

  const nullIndex = select_or_create_to_continue_items.findIndex(
    (item) => item === null
  );
  const item =
    nullIndex !== -1 ? select_or_create_to_continue_items_map[nullIndex] : null;

  const message = item
    ? `Create or select a profile and session to continue`
    : null;

  const handleClearViews = () => {
    go({
      query: {
        profile_id: String(activeProfile?.id),
      },
      type: "push",
    });
    clearViews({});
  };

  const closeDisplay = (section: string) => {
    if (activeLayout) {
      const newLayout = { ...activeLayout };
      newLayout[section].isDisplayed = false;
      setActiveLayout(newLayout);
    }
  };

  let include_components = ["toolbar"];

  return (
    <Authenticated key="home" redirectOnFail="/login">
      <AppLayout authenticatedData={authenticatedData}>
        {isMobile ? (
          <div className="flex flex-col mb-24">
            <Accordion
              multiple
              defaultValue={["action_input", "messages", "views"]}
            >
              {leftSection.isDisplayed && (
                <Accordion.Item value={"action_input"} key={"action_input"}>
                  <Accordion.Control icon={null}>input</Accordion.Control>
                  <Accordion.Panel>
                    <div
                      className={`overflow-auto h-[85vh] ${
                        effectiveScheme === "light"
                          ? "bg-gray-100"
                          : "bg-gray-800"
                      }`}
                    >
                      <div className="h-[85vh] flex flex-col">
                        {" "}
                        {/* Using 85% of viewport height */}
                        {/* Row 1: session switch and actions */}
                        <div className="flex px-3 py-1">
                          <SessionsWrapper
                            // name={action}
                            func_name="fetch_system_sessions"
                            view_id="views:36xo8keq9tsoyly68shk"
                            title="monitor"
                            // record={record}
                            // action={action}
                            display_mode="search_input"
                            success_message_code="fetch_system_sessions"
                          />
                        </div>
                        {/* Row 2: Action Input Toggle Bar */}
                        <ActionToolbar
                          params={params}
                          userSession={user_session}
                          activeInput={activeInput}
                          setActiveInput={setActiveInput}
                          sectionIsExpanded={sectionIsExpanded}
                          setSectionIsExpanded={setSectionIsExpanded}
                          closeDisplay={closeDisplay}
                          includeComponents={["toolbar"]}
                          ExternalSubmitButton={ExternalSubmitButton}
                        />
                        <div className="min-h-0 flex-1 overflow-y-auto pb-6">
                          {/* Row 3: Form Display Area */}
                          <div className="w-full">
                            {activeInput === "info" && (
                              <ActionInputWrapper
                                data_model="info query input"
                                query_name="data_model"
                                collection="data_models"
                                record={{
                                  id: params?.id,
                                }}
                                action="query"
                                action_form_key={`form_${params?.id}`}
                                success_message_code="info_query_input"
                              />
                            )}

                            {activeInput === "natural_language_query" && (
                              <ActionInputWrapper
                                data_model="natural language query input"
                                query_name="data_model"
                                collection="data_models"
                                record={{
                                  id: params?.id,
                                }}
                                action="query"
                                action_form_key={`form_${params?.id}`}
                                success_message_code="natural_language_query_input"
                              />
                            )}
                            {activeInput === "structured_query" && (
                              <ActionInputWrapper
                                data_model="structured query input"
                                query_name="data_model"
                                record={{
                                  id: params?.id,
                                }}
                                action="query"
                                action_form_key={`form_${params?.id}`}
                                success_message_code="structured_query_input"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              )}

              {rightSection.isDisplayed && params?.id && (
                <Accordion.Item value={"messages"} key={"messages"}>
                  <Accordion.Control icon={null}>messages</Accordion.Control>
                  <Accordion.Panel>
                    <MonitorWrapper></MonitorWrapper>
                  </Accordion.Panel>
                </Accordion.Item>
              )}
              {centerSection.isDisplayed && params?.id && (
                <Accordion.Item value={"views"} key={"views"}>
                  <Accordion.Control icon={null}>views</Accordion.Control>
                  <Accordion.Panel>
                    <div className="w-full">
                      {/* // to load in the page content */}
                      {/* {!select_or_create_to_continue_items.some(
                              (item) => item === null
                            ) && children} */}
                      {children && children}
                      {select_or_create_to_continue_items.some(
                        (item) => item === null
                      ) &&
                        ["/home", "/"].includes(parsed?.pathname || "") && (
                          <div className="flex flex-col h-[75vh] items-start justify-center p-4">
                            <div>
                              <Breadcrumbs />
                            </div>
                            <p className="text-sm text-gray-600 max-w-sm">
                              <Highlight
                                component="p"
                                color="lime"
                                highlight={["session", "profile"]}
                                // highlight={
                                //   select_or_create_to_continue_items_map[
                                //     nullIndex
                                //   ] || ""
                                // }
                              >
                                {message || ""}
                              </Highlight>
                            </p>
                          </div>
                        )}
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              )}
            </Accordion>
          </div>
        ) : (
          // Desktop layout with left, center, and right sections
          <PanelGroup direction="horizontal">
            {/* Left Panel */}
            {leftSection.isDisplayed && (
              <Panel
                defaultSize={30}
                minSize={0}
                style={{ display: leftSection.isDisplayed ? "block" : "none" }}
              >
                <div
                  className={`overflow-auto h-[85vh] ${
                    effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800"
                  }`}
                >
                  <div className="h-[85vh] flex flex-col">
                    {" "}
                    {/* Using 85% of viewport height */}
                    {/* Row 1: session switch and actions */}
                    <div className="flex px-3 py-1">
                      <SessionsWrapper
                        // name={action}
                        func_name="fetch_system_sessions"
                        view_id="views:36xo8keq9tsoyly68shk"
                        title="monitor"
                        // record={record}
                        // action={action}
                        display_mode="search_input"
                        success_message_code="fetch_system_sessions"
                      />
                    </div>
                    {/* <DynamicFilter
                      onFilterChange={(item) => console.log(item)}
                    /> */}
                    {/* Row 2: Action Input Toggle Bar */}
                    <ActionToolbar
                      params={params}
                      userSession={user_session}
                      activeInput={activeInput}
                      setActiveInput={setActiveInput}
                      sectionIsExpanded={sectionIsExpanded}
                      setSectionIsExpanded={setSectionIsExpanded}
                      closeDisplay={closeDisplay}
                      includeComponents={["toolbar"]}
                      ExternalSubmitButton={ExternalSubmitButton}
                    />
                    <div className="min-h-0 flex-1 overflow-y-auto pb-6">
                      {/* Row 3: Form Display Area */}
                      {activeInput === "info" && (
                        <ActionInputWrapper
                          data_model="info query input"
                          query_name="data_model"
                          collection="data_models"
                          record={{
                            id: params?.id,
                          }}
                          action="query"
                          action_form_key={`form_${params?.id}`}
                          success_message_code="info_query_input"
                        />
                      )}
                      <div className="w-full">
                        {activeInput === "natural_language_query" && (
                          <ActionInputWrapper
                            data_model="natural language query input"
                            query_name="data_model"
                            record={{
                              id: params?.id,
                            }}
                            action="query"
                            action_form_key={`form_${params?.id}`}
                            success_message_code="natural_language_query_input"
                          />
                        )}
                        {activeInput === "structured_query" && (
                          <ActionInputWrapper
                            data_model="structured query input"
                            query_name="data_model"
                            record={{
                              id: params?.id,
                            }}
                            action="query"
                            action_form_key={`form_${params?.id}`}
                            success_message_code="structured_query_input"
                          />
                        )}
                        {activeInput === "terminal_query" && (
                          <ActionInputWrapper
                            data_model="terminal query input"
                            query_name="data_model"
                            record={{
                              id: params?.id,
                            }}
                            action="query"
                            action_form_key={`form_${params?.id}`}
                            success_message_code="terminal_query_input"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* Center Panel */}

            {centerSection.isDisplayed && (
              <>
                <PanelResizeHandle>
                  <ResizeHandle />
                </PanelResizeHandle>
                <Panel defaultSize={50} minSize={0}>
                  {/* {children && children} */}
                  <div className="">
                    <div
                      className={`overflow-auto h-[85vh] ${
                        effectiveScheme === "light"
                          ? "bg-gray-100"
                          : "bg-gray-800"
                      }`}
                    >
                      <div className="h-[85vh] flex flex-col">
                        {" "}
                        {/* Using 85% of viewport height */}
                        {/* Top component */}
                        {/* <div className="min-h-0 flex-1 overflow-y-auto pb-6"> */}
                        {/* Row 1: Form Display Area */}
                        <div className="w-full">
                          {/* // to load in the page content */}
                          {/* {!select_or_create_to_continue_items.some(
                              (item) => item === null
                            ) && children} */}
                          {children && children}
                          {select_or_create_to_continue_items.some(
                            (item) => item === null
                          ) &&
                            ["/home", "/"].includes(parsed?.pathname || "") && (
                              <div className="flex flex-col h-[75vh] items-center justify-center p-4">
                                <Breadcrumbs />
                                <p className="text-sm text-gray-600 text-center max-w-sm">
                                  <Highlight
                                    component="p"
                                    color="lime"
                                    highlight={["session", "profile"]}
                                    // highlight={
                                    //   select_or_create_to_continue_items_map[
                                    //     nullIndex
                                    //   ] || ""
                                    // }
                                  >
                                    {message || ""}
                                  </Highlight>
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* </div> */}
                </Panel>
              </>
            )}

            {/* Right Panel */}
            {rightSection.isDisplayed && params?.id && (
              <>
                <PanelResizeHandle>
                  <ResizeHandle />
                </PanelResizeHandle>

                <Panel defaultSize={20} minSize={0}>
                  <MonitorWrapper></MonitorWrapper>
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
