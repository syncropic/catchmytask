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
import {
  useComputedColorScheme,
  Highlight,
  Button,
  Tooltip,
  ActionIcon,
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
  } = useAppStore(); // Accessing layout state from Zustand
  const { bulkActionSelect } = useBulkActionSelect();
  const [activeInput, setActiveInput] = useState("structured_query");
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
        (item: any) => item?.message?.code === "query_success_results"
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

  const message = item ? `Create or select a session to continue` : null;

  const handleClearViews = () => {
    go({
      query: {
        profile_id: String(activeProfile?.id),
      },
      type: "push",
    });
    clearViews({});
  };

  return (
    <Authenticated key="home" redirectOnFail="/login">
      <AppLayout authenticatedData={authenticatedData}>
        {isMobile ? (
          <div className="relative flex overflow-x-auto w-full h-screen">
            {/* Left Section */}
            <div
              ref={leftRef}
              className="min-w-full h-screen bg-gray-100 relative"
              style={{ display: leftSection.isDisplayed ? "block" : "none" }}
            >
              {/* Left section content */}
              {activeView && activeTask && (
                <AccordionComponent
                  sections={viewQueryActionAccordionConfig}
                  activeView={activeView}
                  activeTask={activeTask}
                  defaultExpandedValues={["query"]}
                  action={action}
                />
              )}
              {/* {activeView && activeTask && (
                <AccordionComponent
                  sections={viewSearchActionAccordionConfig}
                  activeView={activeView}
                  activeTask={activeTask}
                  defaultExpandedValues={["search"]}
                  action={action}
                />
              )} */}

              {activeView && activeTask && (
                <AccordionComponent
                  sections={activityActionAccordionConfig}
                  activeView={activeView}
                  activeTask={activeTask}
                  defaultExpandedValues={["activity"]}
                  // action={action}
                />
              )}

              {/* Left Scroll Gradient */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200 opacity-75 pointer-events-none" />
            </div>

            {/* Center Section */}
            <div
              ref={centerRef}
              className="min-w-full h-screen relative"
              style={{ display: centerSection.isDisplayed ? "block" : "none" }}
            >
              {/* Center section content */}
              <div className="">
                {/* // to load in the page content */}
                {!select_or_create_to_continue_items.some(
                  (item) => item === null
                ) && children}
                {/* accordion components in the center section */}
                {/* {activeTask && (
                      <AccordionComponent
                        sections={executionAccordionConfig}
                        activeTask={activeTask}
                        activeSession={activeSession}
                        bulkActionSelect={bulkActionSelect}
                        selectedRecords={selectedRecords}
                        defaultExpandedValues={["execution"]}
                      />
                    )} */}

                <div className="w-full">
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

                  {activeTask && action !== "upload" && (
                    <div className="w-full">
                      <ActionStepsWrapper
                        entity_type="action_steps"
                        record={activeTask}
                        aggregate_action_steps={true}
                      />
                    </div>
                  )}
                  {activeTask && action === "upload" && (
                    <div className="w-full">
                      <UploadedWrapper />
                    </div>
                  )}
                </div>

                {/* {!activeSession && (
                      <div
                        className="flex flex-col h-screen items-center justify-center p-4"
                        style={{
                          height: "calc(100vh - 100px)",
                          // paddingBottom: "60px",
                        }}
                      >
                        {children}

                        <Breadcrumbs />
                        <p className="text-sm text-gray-600 text-center max-w-sm">
                          <Highlight color="violet" highlight="session">
                            Create or select a session to continue.
                          </Highlight>
                        </p>
                      </div>
                    )} */}

                {/* {!activeTask && activeSession && (
                      <div
                        className="flex flex-col h-screen items-center justify-center p-4"
                        style={{
                          height: "calc(100vh - 100px)",
                          // paddingBottom: "60px",
                        }}
                      >
                        {children}

                        <Breadcrumbs />
                        <p className="text-sm text-gray-600 text-center max-w-sm">
                          <Highlight color="lime" highlight="task">
                            Create or select a task to continue.
                          </Highlight>
                        </p>
                      </div>
                    )} */}
                {select_or_create_to_continue_items.some(
                  (item) => item === null
                ) && (
                  <div
                    className="flex flex-col h-screen items-center justify-center p-4"
                    style={{
                      height: "calc(100vh - 100px)",
                      // paddingBottom: "60px",
                    }}
                  >
                    {/* {children} */}

                    <Breadcrumbs />
                    <p className="text-sm text-gray-600 text-center max-w-sm">
                      <Highlight
                        component="p"
                        color="lime"
                        highlight={
                          select_or_create_to_continue_items_map[nullIndex] ||
                          ""
                        }
                      >
                        {/* {JSON.stringify(`Create or select a ${select_or_create_to_continue_items_map[nullIndex]} to continue.`)} */}
                        {message || ""}
                      </Highlight>
                      {/* {JSON.stringify(select_or_create_to_continue_items.map((item) => item?.id))}
                          {nullIndex}
                          {select_or_create_to_continue_items_map[nullIndex]} */}
                      {/* {message} */}
                    </p>
                  </div>
                )}
                {/* {children} */}
              </div>
            </div>

            {/* Right Section */}
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
                    {/* Top component */}
                    <div className="min-h-0 flex-1 overflow-y-auto pb-6">
                      {/* {params?.id && actions && (
                // <EventsWrapper
                //   task_id={params?.id}
                //   title="events"
                //   data_items={events || []}
                // />
                <ActionsWrapper
                  task_id={params?.id}
                  title={<ActionListHeader />}
                  data_items={actions || []}
                />
              )} */}
                      {/* Row 1: Form Display Area */}
                      <div className="w-full">
                        {/* {activeInput === "natural_language_query" && (
                          <ActionInputWrapper
                            data_model="natural language query input"
                            query_name="data_model"
                            record={{
                              id: params?.id,
                            }}
                            action="query"
                            action_form_key="query_general"
                            success_message_code="natural_language_query_input"
                          />
                        )} */}

                        {activeInput === "structured_query" && (
                          <ActionInputWrapper
                            data_model="structured query input"
                            query_name="data_model"
                            record={{
                              id: params?.id,
                            }}
                            action="query"
                            action_form_key="query_general"
                            success_message_code="structured_query_input"
                          />
                        )}
                        {/* {activeInput === "components_query" && (
                          <ActionInputWrapper
                            data_model="components query input"
                            query_name="data_model"
                            record={{
                              id: params?.id,
                            }}
                            action="query"
                            action_form_key="query_general"
                            success_message_code="components_query_input"
                          />
                        )} */}
                      </div>
                    </div>
                    {/* Bottom component */}
                    <div>
                      {/* <div>
                <AccordionComponent
                  sections={viewSearchActionAccordionConfig}
                  activeView={{}}
                  activeTask={{}}
                  defaultExpandedValues={[]}
                  action={"filters"}
                />
              </div> */}
                      {/* <ActionListHeader /> */}
                      <div className="flex px-5">
                        <SessionsWrapper
                          // name={action}
                          query_name="fetch sessions"
                          view_id="views:36xo8keq9tsoyly68shk"
                          title="monitor"
                          // record={record}
                          // action={action}
                          display_mode="search_input"
                          success_message_code="action_input_data_model_schema"
                        />
                      </div>

                      {/* Row 2: Action Input Bar */}
                      <div className="w-full flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                        {/* Toggle Buttons */}
                        {/* <Button
                          size="compact-sm"
                          variant={
                            activeInput === "natural_language_query"
                              ? "outline"
                              : "default"
                          }
                          onClick={() =>
                            setActiveInput("natural_language_query")
                          }
                          className="whitespace-nowrap"
                        >
                          Natural
                        </Button> */}
                        {/* <Button
                          size="compact-sm"
                          variant={
                            activeInput === "components_query"
                              ? "outline"
                              : "default"
                          }
                          onClick={() => setActiveInput("components_query")}
                          className="whitespace-nowrap"
                        >
                          Components
                        </Button> */}
                        {/* <Tooltip
                          withArrow
                          transitionProps={{ duration: 200 }}
                          label="clear views"
                        >
                          <ActionIcon
                            size="xs"
                            variant="default"
                            aria-label="clear view"
                            onClick={handleClearViews}
                          >
                            <IconIconsOff size={24} />
                          </ActionIcon>
                        </Tooltip> */}

                        {/* <Tooltip
                          withArrow
                          transitionProps={{ duration: 200 }}
                          label="attach files"
                        >
                          <ActionIcon
                            size="xs"
                            variant="default"
                            aria-label="attachments"
                          >
                            <IconPaperclip size={24} />
                          </ActionIcon>
                        </Tooltip> */}

                        {/* <Button
                          size="compact-sm"
                          variant={
                            activeInput === "structured_query"
                              ? "outline"
                              : "default"
                          }
                          onClick={() => setActiveInput("structured_query")}
                          className="whitespace-nowrap"
                        >
                          Structured Language
                        </Button> */}

                        {/* Submit Button */}

                        <ExternalSubmitButton
                          record={{}}
                          entity_type="tasks"
                          action_form_key={`query_${
                            params?.id || activeTask?.id
                          }`}
                          action={"query"}
                        />
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
                  {children && children}
                  <div className="">
                    {/* // to load in the page content */}
                    {!select_or_create_to_continue_items.some(
                      (item) => item === null
                    ) && children}

                    {select_or_create_to_continue_items.some(
                      (item) => item === null
                    ) &&
                      ["/home", "/"].includes(parsed?.pathname || "") && (
                        <div
                          className="flex flex-col h-screen items-center justify-center p-4"
                          // style={{
                          //   height: "calc(100vh - 100px)",
                          //   // paddingBottom: "60px",
                          // }}
                        >
                          {/* {children} */}

                          <Breadcrumbs />
                          <p className="text-sm text-gray-600 text-center max-w-sm">
                            <Highlight
                              component="p"
                              color="lime"
                              highlight={
                                select_or_create_to_continue_items_map[
                                  nullIndex
                                ] || ""
                              }
                            >
                              {message || ""}
                            </Highlight>
                          </p>
                        </div>
                      )}
                  </div>
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
