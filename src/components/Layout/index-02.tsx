import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  Authenticated,
  useGo,
  useIsAuthenticated,
  useParsed,
} from "@refinedev/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ResizeHandle from "@components/ResizeHandle";
import { useDomainData } from "@components/Utils/useDomainData";
import { useSessionAndTask } from "@components/Utils/useSessionAndTask";
import AccordionComponent from "@components/AccordionComponent";
import ErrorComponent from "@components/ErrorComponent";
import Breadcrumbs from "@components/Breadcrumbs";
import AppLayout from "./AppLayout";
import { useAppStore } from "src/store"; // Zustand store
import { useComputedColorScheme, Highlight, Button } from "@mantine/core";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"; // Icons for scroll hints
import {
  getComponentByKey,
  useBulkActionSelect,
  useIsMobile,
} from "@components/Utils";
import { searchActionAccordionConfig } from "./searchActionAccordionConfig";
import { stateViewAccordionConfig } from "./stateViewAccordionConfig";
import { planViewAccordionConfig } from "./planAccordionConfig";
import { executionAccordionConfig } from "./executionAccordionConfig";
import { saveActionAccordionConfig } from "./saveActionAccordionConfig";
import { summaryViewAccordionConfig } from "./summaryAccordionConfig";
import { issuesViewAccordionConfig } from "./issuesAccordionConfig";
import { actionInputAccordionConfig } from "./actionInputAccordionConfig";
import InitializeApplication from "@components/Utils/InitializeApplication";
import { ComponentKey } from "@components/interfaces";
import MonacoEditor from "@components/MonacoEditor";
import { runActionAccordionConfig } from "./runActionAccordionConfig";
import ActionStepsWrapper from "@components/ActionSteps";
import BulkOperationsToolbar from "@components/BulkOperationsToolbar";
import { viewAccordionConfig } from "./viewAccordionConfig";
import { viewSearchActionAccordionConfig } from "./viewSearchActionAccordionConfig";
import { UploadedWrapper } from "@components/Uploaded";
import { actionAccordionConfig } from "./actionAccordionConfig";
import { activityActionAccordionConfig } from "./activityActionAccordionConfig";
import { Carousel } from "@mantine/carousel";
import { viewQueryActionAccordionConfig } from "./viewQueryActionAccordionConfig";
import { customComponentsAccordionConfig } from "./customComponentsAccordionConfig";
import { sessionQueryActionAccordionConfig } from "./sessionQueryActionAccordionConfig";
import ActivityWrapper from "@components/Activity";

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
    pinned_action_steps,
    navigationHistory,
  } = useAppStore(); // Accessing layout state from Zustand
  const { bulkActionSelect } = useBulkActionSelect();

  const { leftSection, centerSection, rightSection } = activeLayout; // Destructure the sections for visibility checks

  const computedColorScheme = useComputedColorScheme("light"); // Default to light theme if auto is selected
  const effectiveScheme =
    colorScheme.scheme === "auto" ? computedColorScheme : colorScheme.scheme;

  useSessionAndTask(domainRecord);
  const go = useGo(); // Navigation function
  const parsed = useParsed(); // Parsed pathname from useParsed hook

  // Redirect handling for task and session
  // redirectToActiveTask({
  //   authenticatedData,
  //   activeTask,
  //   activeSession,
  //   activeApplication: domainRecord?.application,
  //   activeView,
  //   // go,
  // });

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

  // if (isLoadingDomainData || isLoadingAuthenticatedData) return <>Loading...</>;
  // if (errorDomainData || errorAuthenticatedData) {
  //   let component = errorDomainData
  //     ? "error loading domain data"
  //     : "error loading authenticated data";
  //   return (
  //     <ErrorComponent
  //       error={errorDomainData || isLoadingAuthenticatedData}
  //       component={component}
  //     />
  //   );
  // }

  // const [hasRedirected, setHasRedirected] = useState(false);

  // useEffect(() => {
  //   if (authenticatedData?.authenticated && navigationHistory && parsed?.pathname !== "/home" && !hasRedirected) {
  //     setHasRedirected(true);
  //     go({
  //       to: navigationHistory?.pathname,
  //       query: navigationHistory?.params,
  //       type: "push",
  //     });
  //   }
  // }, [authenticatedData, navigationHistory, parsed?.pathname, hasRedirected, go]);

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

  // if (authenticatedData?.authenticated && navigationHistory && parsed?.pathname !== "/home") {
  //   go({
  //     to: {
  //       resource: "tasks",
  //       action: "show",
  //       id: activeTask?.id,
  //       meta: navigationHistory?.params,
  //     },
  //     query: navigationHistory?.params,
  //     type: "push",
  //   });
  // }

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

  const message = item ? `Create or select a ${item} to continue` : null;

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
            <div
              ref={rightRef}
              className="min-w-full h-screen bg-gray-100 relative"
              style={{ display: rightSection.isDisplayed ? "block" : "none" }}
            >
              {/* Right section content */}
              {/* state view */}
              <AccordionComponent
                sections={stateViewAccordionConfig}
                activeTask={activeTask}
                activeSession={activeSession}
              />
              {/* pinned action step issues */}
              {activeTask &&
                action &&
                !["save", "search", "upload"]?.includes(action) && (
                  <AccordionComponent
                    sections={actionInputAccordionConfig}
                    selectedRecords={selectedRecords}
                    action={action}
                    activeTask={activeTask}
                    defaultExpandedValues={["action_input"]}
                  />
                )}

              {/* plan accordion component */}
              {/* {activeTask && (
                <AccordionComponent
                  sections={planViewAccordionConfig}
                  activeTask={activeTask}
                  activeSession={activeSession}
                  defaultExpandedValues={[]}
                />
              )} */}
              {activeTask && (
                <AccordionComponent
                  sections={actionAccordionConfig}
                  activeTask={activeTask}
                  activeSession={activeSession}
                  record={activeView}
                  defaultExpandedValues={[]}
                  action="view_modes"
                />
              )}
              {/* Right Scroll Gradient */}

              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-200 opacity-75 pointer-events-none" />
            </div>

            {/* Scroll Hints */}
            {showScrollHint && (
              <>
                {/* Left Scroll Hint */}
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <IconArrowLeft />
                </div>
                {/* Right Scroll Hint */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <IconArrowRight />
                </div>
              </>
            )}
          </div>
        ) : (
          // Desktop layout with left, center, and right sections
          <PanelGroup direction="horizontal">
            {/* Left Panel */}
            {leftSection.isDisplayed && (
              <Panel
                defaultSize={20}
                minSize={0}
                style={{ display: leftSection.isDisplayed ? "block" : "none" }}
              >
                <div
                  className={`lg:block overflow-auto h-[80vh] ${
                    effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800"
                  }`}
                >
                  {/* state view */}
                  <AccordionComponent
                    sections={stateViewAccordionConfig}
                    activeTask={activeTask}
                    activeSession={activeSession}
                  />
                  {/* activity wrapper search list */}
                  <ActivityWrapper
                    // name={action}
                    query_name="fetch issues"
                    view_id="views:74nxj7igmhnykf87k9zh"
                    // record={record}
                    // action={action}
                    success_message_code="action_input_data_model_schema"
                  />
                  {/* {activeView && activeTask && (
                    <AccordionComponent
                      sections={viewSearchActionAccordionConfig}
                      activeView={activeView}
                      activeTask={activeTask}
                      defaultExpandedValues={["search"]}
                      action={action}
                    />
                  )} */}
                  {/* {!activeView && !activeTask && <div>session input form</div>} */}
                  {/* session query */}
                  {/* {activeSession && !activeView && !activeTask && (
                    <AccordionComponent
                      sections={sessionQueryActionAccordionConfig}
                      activeView={activeView}
                      activeTask={activeTask}
                      activeSession={activeSession}
                      defaultExpandedValues={["session_query"]}
                      action={action}
                    />
                  )} */}
                  {/* session activity */}
                  {/* {activeSession && !activeView && !activeTask && (
                    <AccordionComponent
                      sections={activityActionAccordionConfig}
                      activeView={activeView}
                      activeTask={activeTask}
                      defaultExpandedValues={["activity"]}
                      action={"activity"}
                    />
                  )} */}

                  {/* {activeView && activeTask && (
                    <AccordionComponent
                      sections={viewQueryActionAccordionConfig}
                      activeView={activeView}
                      activeTask={activeTask}
                      defaultExpandedValues={["query"]}
                      action={action}
                    />
                  )} */}

                  {/* {activeView && activeTask && (
                    <AccordionComponent
                      sections={activityActionAccordionConfig}
                      activeView={activeView}
                      activeTask={activeTask}
                      defaultExpandedValues={["activity"]}
                      action={"activity"}
                    />
                  )} */}

                  {/* <div>{JSON.stringify(activeView)}</div> */}
                  {/* Left section content */}
                  {/* {pinned_main_action === "search" && (
                    <AccordionComponent
                      sections={searchActionAccordionConfig}
                      defaultExpandedValues={["search"]}
                    />
                  )} */}
                  {/* {action && pinned_main_action === "save" && (
                    <AccordionComponent
                      sections={saveActionAccordionConfig}
                      defaultExpandedValues={["save"]}
                    />
                  )} */}
                  {/* {action && pinned_main_action === "run" && (
                    <AccordionComponent
                      activeTask={activeTask}
                      sections={runActionAccordionConfig}
                      defaultExpandedValues={["run"]}
                    />
                  )} */}
                </div>
              </Panel>
            )}

            {/* Center Panel */}

            {centerSection.isDisplayed && (
              <>
                <PanelResizeHandle>
                  <ResizeHandle />
                </PanelResizeHandle>
                <Panel defaultSize={30} minSize={0}>
                  {children && children}
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
                    ) &&
                      ["/home", "/"].includes(parsed?.pathname || "") && (
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
            {rightSection.isDisplayed && (
              <>
                <PanelResizeHandle>
                  <ResizeHandle />
                </PanelResizeHandle>
                <Panel
                  defaultSize={50}
                  minSize={0}
                  style={{
                    display: rightSection.isDisplayed ? "block" : "none",
                  }}
                >
                  <div
                    className={`overflow-auto h-[80vh] ${
                      effectiveScheme === "light"
                        ? "bg-gray-100"
                        : "bg-gray-800"
                    }`}
                  >
                    {/* state view */}
                    {/* <AccordionComponent
                      sections={stateViewAccordionConfig}
                      activeTask={activeTask}
                      activeSession={activeSession}
                    /> */}
                    {/* pinned action step issues */}
                    {/* {activeTask &&
                      action &&
                      !["save", "search", "upload"]?.includes(action) && (
                        <AccordionComponent
                          sections={actionInputAccordionConfig}
                          selectedRecords={selectedRecords}
                          action={action}
                          activeTask={activeTask}
                          defaultExpandedValues={["action_input"]}
                        />
                      )} */}
                    {/* pinned action step summary */}
                    {/* {activeTask &&
                      pinned_action_steps["summary"]?.is_displayed && (
                        <AccordionComponent
                          sections={summaryViewAccordionConfig}
                          selectedRecords={selectedRecords}
                          defaultExpandedValues={["summary"]}
                        />
                      )} */}
                    {/* pinned action step issues */}
                    {/* {activeTask &&
                      pinned_action_steps["issues"]?.is_displayed && (
                        <AccordionComponent
                          sections={issuesViewAccordionConfig}
                          selectedRecords={selectedRecords}
                          defaultExpandedValues={["issues"]}
                        />
                      )} */}
                    {/* <AccordionComponent
                      sections={viewAccordionConfig}
                      // selectedRecords={selectedRecords}
                      defaultExpandedValues={["view"]}
                    /> */}
                    {/* plan accordion component */}
                    {/* {activeTask && (
                      <AccordionComponent
                        sections={planViewAccordionConfig}
                        activeTask={activeTask}
                        activeSession={activeSession}
                        defaultExpandedValues={[]}
                      />
                    )} */}
                    {activeTask && activeView && activeSession && (
                      <AccordionComponent
                        sections={customComponentsAccordionConfig}
                        activeTask={activeTask}
                        activeSession={activeSession}
                        // record={activeView}
                        defaultExpandedValues={["custom_components"]}
                        // action="view_modes"
                      />
                    )}
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
