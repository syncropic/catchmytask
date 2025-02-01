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
  Drawer,
  Menu,
  Modal,
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
import { handleLogout } from "@components/Utils/auth";
import SessionSummaryInfoCard from "@components/Sessions/SessionSummaryInfoCard";
import DesktopPanelLayout from "./DesktopPanelLayout";
import InteractiveGraph from "@components/InteractiveGraph";
import { MenuItems } from "./UserMenu";
import NavbarSearch from "@components/Navbar";
import UserMenuMobile from "./UserMenuMobile";
import SessionActionInput from "@components/SessionActionInput";

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
    setNavigationHistory,
    global_input_mode,
    global_session_trace_mode,
  } = useAppStore(); // Accessing layout state from Zustand
  const { bulkActionSelect } = useBulkActionSelect();
  const { data: user_session } = useSession();
  const { params, pathname } = useParsed();
  let global_input_mode_developer =
    global_input_mode === "developer" ? true : false;
  let global_input_mode_user = global_input_mode === "user" ? true : false;
  let global_input_mode_trace = global_input_mode === "trace" ? true : false;
  let global_input_mode_terminal =
    global_input_mode === "terminal" ? true : false;

  const { displaySidebar, toggleDisplaySidebar } = useAppStore();

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

  let is_invalid_token = Boolean(
    user_session?.userProfile?.detail &&
      typeof user_session.userProfile.detail === "string" &&
      user_session.userProfile.detail.includes(
        "Invalid authentication credentials"
      )
  );

  // Create storage handler for layout persistence
  const layoutStorage = useMemo(
    () => ({
      getItem(name: any) {
        try {
          // Check if layout data exists in URL params
          const layoutData = params?.layout;
          if (!layoutData) return "";
          const parsed = JSON.parse(decodeURI(layoutData));
          return parsed[name] || "";
        } catch (error) {
          console.error("Error reading layout:", error);
          return "";
        }
      },
      setItem(name: any, value: any) {
        try {
          // Get existing layout data from params
          const currentLayout = params?.layout
            ? JSON.parse(decodeURI(params.layout))
            : {};

          // Update with new values
          const newLayout = {
            ...currentLayout,
            [name]: value,
          };

          // // Update URL with new layout data
          // go({
          //   to: pathname,
          //   query: {
          //     ...params,
          //     layout: encodeURI(JSON.stringify(newLayout)),
          //   },
          //   type: "replace",
          // });
        } catch (error) {
          console.error("Error saving layout:", error);
        }
      },
    }),
    [params, pathname, go]
  );

  // Automatically hide the scroll hint after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollHint(false);
    }, 3000); // Hide after 3 seconds
    return () => clearTimeout(timer);
  }, []);

  // In your UserMenu component:
  const handleLogoutClick = async () => {
    setNavigationHistory({
      pathname: pathname,
      params: params,
    });

    // // Clear any app-specific state
    // setActiveProfile(null);
    // setActiveFloatingWindow(null);
    // setIsFloatingWindowOpen(false);
    // setMonitorComponents([]);

    // Call the utility function to handle complete logout
    await handleLogout();
  };

  // Add useEffect near the top of your component where other hooks are
  useEffect(() => {
    if (is_invalid_token) {
      console.log("routing to login page");
      // handleLogoutClick();
      go({
        to: "/login",
        type: "push",
      });
    }
  }, [is_invalid_token, go]); // Only run when is_invalid_token changes

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
                    <>
                      {/* {JSON.stringify(
                        application["titles"]?.find(
                          (title: any) =>
                            title["metadata"]["section"] === `${section}`
                        )
                      )} */}
                      <Component
                        title={
                          application?.titles?.length > 0
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
                    </>
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
        {isMobile && <SessionActionInput />}

        <Drawer
          opened={displaySidebar}
          onClose={toggleDisplaySidebar}
          // title="Sidebar"
          offset={8}
        >
          {/* <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button>Toggle menu</Button>
            </Menu.Target>

            <MenuItems />
          </Menu> */}
          <div className="flex flex-col gap-2">
            <div className="sticky top-10 z-10">
              <UserMenuMobile />
            </div>
            {activeSession && (
              <SessionSummaryInfoCard
                session={activeSession}
                execlude_components={["toolbar"]}
              />
            )}

            <NavbarSearch></NavbarSearch>
          </div>
        </Drawer>

        {isMobile ? (
          <div className="flex flex-col mb-24">
            <Accordion
              multiple
              defaultValue={["action_input", "messages", "views"]}
            >
              {rightSection.isDisplayed && (
                <MonitorWrapper></MonitorWrapper>
                // <Accordion.Item value={"messages"} key={"messages"}>
                //   <Accordion.Control icon={null}>messages</Accordion.Control>
                //   <Accordion.Panel>
                //     <MonitorWrapper></MonitorWrapper>
                //   </Accordion.Panel>
                // </Accordion.Item>
              )}
              {/* {leftSection.isDisplayed && (
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
                        <div className="sticky top-0 z-10">
                          {!global_developer_mode &&
                            !global_session_trace_mode &&
                            activeSession && (
                              <SessionSummaryInfoCard
                                session={activeSession}
                              ></SessionSummaryInfoCard>
                            )}
                        </div>{" "}
                        {!global_developer_mode &&
                          !global_session_trace_mode && (
                            <div>
                              <ActionInputWrapper
                                data_model="user mode query input"
                                query_name="data_model"
                                record={{ id: params?.id }}
                                action="query"
                                action_form_key={`form_${params?.id}`}
                                success_message_code="user_mode_query_input"
                              />
                            </div>
                          )}
                      </div>
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              )} */}
            </Accordion>
          </div>
        ) : (
          // Replace this entire PanelGroup section with:
          <DesktopPanelLayout
            global_developer_mode={
              global_input_mode_developer || global_input_mode_terminal
            }
            leftSection={{
              isDisplayed: leftSection.isDisplayed,
              children: (
                <>
                  <div className="sticky top-0 z-10">
                    {global_input_mode_user && activeSession && params?.id && (
                      <SessionSummaryInfoCard session={activeSession} />
                    )}
                  </div>
                  {global_input_mode_trace && (
                    <div>
                      {/* <InteractiveGraph /> */}
                      <div>interactive graph</div>
                    </div>
                  )}
                  {global_input_mode_user && (
                    <div>
                      <ActionInputWrapper
                        data_model="user mode query input"
                        query_name="data_model"
                        record={{ id: params?.id }}
                        action="query"
                        action_form_key={`form_${params?.id}`}
                        success_message_code="user_mode_query_input"
                      />
                    </div>
                  )}
                  {global_input_mode_developer && (
                    <>
                      <ActionToolbar
                        params={params}
                        userSession={user_session}
                        activeInput={activeInput}
                        setActiveInput={setActiveInput}
                        sectionIsExpanded={sectionIsExpanded}
                        setSectionIsExpanded={setSectionIsExpanded}
                        closeDisplay={closeDisplay}
                        includeComponents={["toolbar"]}
                      />
                      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
                        <div className="w-full h-full">
                          {" "}
                          {/* Add h-full here */}
                          <div className="flex w-full h-full">
                            {" "}
                            {/* Removed gap-4 */}
                            {/* Left Column - Natural Language Query */}
                            <div className="w-[45%] min-w-0">
                              <ActionInputWrapper
                                data_model="developer mode query input"
                                query_name="data_model"
                                record={{ id: params?.id }}
                                action="query"
                                action_form_key={`form_${params?.id}`}
                                success_message_code="developer_mode_query_input"
                              />
                            </div>
                            {/* Middle Column - Submit Buttons (No spacing) */}
                            <div className="w-auto min-w-0 h-full flex-shrink-0">
                              <div className="flex flex-col h-full">
                                {/* First section - 75% height */}
                                <div className="h-[75%] flex flex-col justify-center">
                                  <div className="flex flex-col gap-10">
                                    <ExternalSubmitButton
                                      record={{}}
                                      entity_type="sessions"
                                      action_form_key={`form_${params?.id}`}
                                      action="query"
                                      icon={"IconArrowRight"}
                                    />
                                    <ExternalSubmitButton
                                      record={{}}
                                      entity_type="sessions"
                                      action_form_key={`form_${params?.id}`}
                                      action="query"
                                      icon={"IconArrowLeft"}
                                    />
                                  </div>
                                </div>

                                {/* Second section - 25% height */}
                                <div className="h-[25%] flex flex-col">
                                  <div className="flex flex-col gap-10">
                                    {/* <ExternalSubmitButton
                                      record={{}}
                                      entity_type="sessions"
                                      action_form_key={`form_${params?.id}`}
                                      action="query"
                                      icon={"IconArrowRight"}
                                    /> */}
                                    {/* <ExternalSubmitButton
                                      record={{}}
                                      entity_type="sessions"
                                      action_form_key={`form_${params?.id}`}
                                      action="query"
                                      icon={"IconArrowLeft"}
                                    /> */}
                                    <ExternalSubmitButton
                                      record={{}}
                                      entity_type="command"
                                      action_form_key={`form_${params?.id}`}
                                      action="command"
                                      actionProps={{
                                        color: "green",
                                      }}
                                      icon={"IconLocationCode"}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* Right Column - Structured Query */}
                            <div className="w-[53%] min-w-0">
                              <ActionInputWrapper
                                data_model="structured query input"
                                query_name="data_model"
                                record={{ id: params?.id }}
                                action="query"
                                action_form_key={`form_${params?.id}`}
                                success_message_code="structured_query_input"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {global_input_mode_terminal && (
                    <>
                      {/* <ActionToolbar
                        params={params}
                        userSession={user_session}
                        activeInput={activeInput}
                        setActiveInput={setActiveInput}
                        sectionIsExpanded={sectionIsExpanded}
                        setSectionIsExpanded={setSectionIsExpanded}
                        closeDisplay={closeDisplay}
                        includeComponents={["toolbar"]}
                      /> */}
                      <div className="min-h-0 flex-1 overflow-y-auto pb-6">
                        <div className="w-full h-full">
                          {" "}
                          {/* Add h-full here */}
                          <div className="flex w-full h-full">
                            {" "}
                            {/* Removed gap-4 */}
                            {/* Right Column - Structured Query */}
                            <div className="w-[45%] min-w-0">
                              {/* <ActionInputWrapper
                                data_model="structured query input"
                                query_name="data_model"
                                record={{ id: params?.id }}
                                action="query"
                                action_form_key={`form_${params?.id}`}
                                success_message_code="structured_query_input"
                              /> */}
                              <div>recommendation graph</div>
                            </div>
                            {/* Left Column - Natural Language Query */}
                            <div className="w-[53%] min-w-0">
                              {/* <ActionInputWrapper
                                data_model="terminal query input"
                                query_name="data_model"
                                record={{ id: params?.id }}
                                action="query"
                                action_form_key={`form_${params?.id}`}
                                success_message_code="terminal_query_input"
                              /> */}
                              <ExternalSubmitButton
                                record={{}}
                                entity_type="command"
                                action_form_key={`form_${params?.id}`}
                                action="command"
                                actionProps={{
                                  color: "green",
                                }}
                                icon={"IconLocationCode"}
                              />
                            </div>
                            {/* Middle Column - Submit Buttons (No spacing) */}
                            <div className="w-auto min-w-0 h-full flex-shrink-0">
                              <div className="flex flex-col h-full">
                                {/* First section - 75% height */}
                                <div className="h-[75%] flex flex-col justify-center">
                                  <div className="flex flex-col gap-10">
                                    {/* <ExternalSubmitButton
                                      record={{}}
                                      entity_type="sessions"
                                      action_form_key={`form_${params?.id}`}
                                      action="query"
                                      icon={"IconArrowRight"}
                                    /> */}
                                    {/* <ExternalSubmitButton
                                      record={{}}
                                      entity_type="sessions"
                                      action_form_key={`form_${params?.id}`}
                                      action="query"
                                      icon={"IconArrowLeft"}
                                    /> */}
                                  </div>
                                </div>

                                {/* Second section - 25% height */}
                                <div className="h-[25%] flex flex-col justify-end">
                                  <div className="flex flex-col gap-10">
                                    {/* <ExternalSubmitButton
                                      record={{}}
                                      entity_type="sessions"
                                      action_form_key={`form_${params?.id}`}
                                      action="query"
                                      icon={"IconArrowRight"}
                                    />
                                    <ExternalSubmitButton
                                      record={{}}
                                      entity_type="sessions"
                                      action_form_key={`form_${params?.id}`}
                                      action="query"
                                      icon={"IconArrowLeft"}
                                    /> */}
                                    {/* <ExternalSubmitButton
                                      record={{}}
                                      entity_type="command"
                                      action_form_key={`form_${params?.id}`}
                                      action="command"
                                      actionProps={{
                                        color: "green",
                                      }}
                                      icon={"IconLocationCode"}
                                    /> */}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ),
            }}
            centerSection={{
              isDisplayed: centerSection.isDisplayed,
              children: (
                <>
                  {children}
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
                          >
                            {message || ""}
                          </Highlight>
                        </p>
                      </div>
                    )}
                </>
              ),
            }}
            rightSection={{
              isDisplayed: rightSection.isDisplayed,
              // children: null,
              children: <MonitorWrapper />,
            }}
            effectiveScheme={effectiveScheme}
            layoutStorage={layoutStorage}
          >
            {children}
          </DesktopPanelLayout>
        )}
      </AppLayout>
    </Authenticated>
  );
};

export default Layout;
