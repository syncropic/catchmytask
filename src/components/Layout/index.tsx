import React, { useRef, useState, useEffect } from "react";
import { Authenticated, useIsAuthenticated } from "@refinedev/core";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ResizeHandle from "@components/ResizeHandle";
import { useDomainData } from "@components/Utils/useDomainData";
import { useSessionAndTask } from "@components/Utils/useSessionAndTask";
import AccordionComponent from "@components/AccordionComponent";
import ErrorComponent from "@components/ErrorComponent";
import { sampleAccordionConfig } from "./sampleAccordionConfig";
import Breadcrumbs from "@components/Breadcrumbs";
import QuickActionsBar from "@components/QuickActionsBar";
import StateView from "@components/StateView";
import AppLayout from "./AppLayout";
import { useMediaQuery } from "@mantine/hooks";
import { useAppStore } from "src/store"; // Zustand store
import { useComputedColorScheme, Highlight } from "@mantine/core";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"; // Icons for scroll hints
import { useIsMobile } from "@components/Utils";
import { searchAccordionConfig } from "./searchActionAccordionConfig";
import { stateViewAccordionConfig } from "./stateViewAccordionConfig";

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
    error: errorDomainData,
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
  } = useAppStore(); // Accessing layout state from Zustand

  const { leftSection, centerSection, rightSection } = activeLayout; // Destructure the sections for visibility checks

  const computedColorScheme = useComputedColorScheme("light"); // Default to light theme if auto is selected
  const effectiveScheme =
    colorScheme.scheme === "auto" ? computedColorScheme : colorScheme.scheme;

  useSessionAndTask(domainRecord);

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

  if (isLoadingDomainData || isLoadingAuthenticatedData) return <>Loading...</>;
  if (errorDomainData || errorAuthenticatedData) {
    let component = errorDomainData
      ? "error loading domain data"
      : "error loading authenticated data";
    return (
      <ErrorComponent
        error={errorDomainData || isLoadingAuthenticatedData}
        component={component}
      />
    );
  }

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
              {action && pinned_main_action === action && (
                <AccordionComponent
                  sections={searchAccordionConfig}
                  activeTask={domainRecord?.activeTask}
                  activeSession={domainRecord?.activeSession}
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
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
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
                        Create or select a session to continue.
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
                        Create or select a task to continue.
                      </Highlight>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section */}
            <div
              ref={rightRef}
              className="min-w-full h-screen bg-gray-100 relative"
              style={{ display: rightSection.isDisplayed ? "block" : "none" }}
            >
              {/* Right section content */}
              <AccordionComponent
                sections={stateViewAccordionConfig}
                activeTask={domainRecord?.activeTask}
                activeSession={domainRecord?.activeSession}
              />
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
                  className={`lg:block overflow-auto h-screen ${
                    effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800"
                  }`}
                >
                  {/* Left section content */}
                  {action && pinned_main_action === action && (
                    <AccordionComponent
                      sections={searchAccordionConfig}
                      activeTask={domainRecord?.activeTask}
                      activeSession={domainRecord?.activeSession}
                    />
                  )}
                </div>
              </Panel>
            )}

            {/* Center Panel */}
            {centerSection.isDisplayed && (
              <>
                <PanelResizeHandle>
                  <ResizeHandle />
                </PanelResizeHandle>
                <Panel defaultSize={60} minSize={30}>
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                    {/* <QuickActionsBar />
                    <StateView />
                    {/* {children} */}
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
                            Create or select a session to continue.
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
                            Create or select a task to continue.
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
                  defaultSize={20}
                  minSize={0}
                  style={{
                    display: rightSection.isDisplayed ? "block" : "none",
                  }}
                >
                  <div
                    className={`overflow-auto h-screen ${
                      effectiveScheme === "light"
                        ? "bg-gray-100"
                        : "bg-gray-800"
                    }`}
                  >
                    {/* Placeholder for right panel content */}
                    <AccordionComponent
                      sections={stateViewAccordionConfig}
                      activeTask={domainRecord?.activeTask}
                      activeSession={domainRecord?.activeSession}
                    />
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
