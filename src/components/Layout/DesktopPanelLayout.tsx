import React, { useState, useEffect, useRef } from "react";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import ResizeHandle from "@components/ResizeHandle";
import MonitorWrapper from "@components/Monitor";

interface PanelSection {
  isDisplayed: boolean;
  children?: React.ReactNode;
}

interface LayoutStorage {
  getItem: (name: string) => string;
  setItem: (name: string, value: string) => void;
}

interface PanelSizes {
  left: number;
  center: number;
  right: number;
}

interface DesktopPanelLayoutProps {
  global_developer_mode: boolean;
  leftSection: PanelSection;
  centerSection: PanelSection;
  rightSection: PanelSection;
  effectiveScheme: string;
  children: React.ReactNode;
  layoutStorage: LayoutStorage;
}

const DesktopPanelLayout: React.FC<DesktopPanelLayoutProps> = ({
  global_developer_mode,
  leftSection,
  centerSection,
  rightSection,
  effectiveScheme,
  children,
  layoutStorage,
}) => {
  // Refs for imperative panel control
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const centerPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  // State to track current panel sizes
  const [sizes, setSizes] = useState<PanelSizes>({
    left: 30,
    center: 50,
    right: 20,
  });

  // Update panel sizes when global_developer_mode changes
  useEffect(() => {
    const newSizes = {
      left: global_developer_mode ? 40 : 30,
      center: global_developer_mode ? 40 : 50,
      right: 20,
    };
    setSizes(newSizes);

    // Use imperative handles to resize panels - with null checks
    setTimeout(() => {
      if (leftPanelRef.current && leftSection.isDisplayed) {
        leftPanelRef.current.resize(newSizes.left);
      }
      if (centerPanelRef.current && centerSection.isDisplayed) {
        centerPanelRef.current.resize(newSizes.center);
      }
      if (rightPanelRef.current && rightSection.isDisplayed) {
        rightPanelRef.current.resize(newSizes.right);
      }
    }, 0);
  }, [
    global_developer_mode,
    leftSection.isDisplayed,
    centerSection.isDisplayed,
    rightSection.isDisplayed,
  ]);

  // Handle manual panel resizing
  const handleLayout = (newSizes: number[]) => {
    // Map newSizes based on which panels are displayed
    const updatedSizes: PanelSizes = { ...sizes };
    let index = 0;

    if (leftSection.isDisplayed) {
      updatedSizes.left = newSizes[index++];
    }
    if (centerSection.isDisplayed) {
      updatedSizes.center = newSizes[index++];
    }
    if (rightSection.isDisplayed) {
      updatedSizes.right = newSizes[index];
    }

    setSizes(updatedSizes);
  };

  return (
    <PanelGroup
      direction="horizontal"
      onLayout={handleLayout}
      autoSaveId="main-layout"
      // storage={layoutStorage}
    >
      {leftSection.isDisplayed && (
        <>
          <Panel
            ref={leftPanelRef}
            id="left-panel"
            order={1}
            minSize={0}
            defaultSize={sizes.left}
          >
            <div
              className={`overflow-auto h-[90vh] ${
                effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800"
              }`}
            >
              <div className="h-[90vh] flex flex-col">
                {leftSection.children}
              </div>
            </div>
          </Panel>
          <PanelResizeHandle>
            <ResizeHandle />
          </PanelResizeHandle>
        </>
      )}

      {centerSection.isDisplayed && (
        <Panel
          ref={centerPanelRef}
          id="center-panel"
          order={2}
          minSize={0}
          defaultSize={sizes.center}
        >
          <div
            className={`overflow-auto h-[90vh] ${
              effectiveScheme === "light" ? "bg-gray-100" : "bg-gray-800"
            }`}
          >
            <div className="h-[90vh] flex flex-col">
              {centerSection.children}
            </div>
          </div>
        </Panel>
      )}

      {rightSection.isDisplayed && (
        <>
          <PanelResizeHandle>
            <ResizeHandle />
          </PanelResizeHandle>
          <Panel
            ref={rightPanelRef}
            id="right-panel"
            order={3}
            minSize={0}
            defaultSize={sizes.right}
          >
            {rightSection.children}
          </Panel>
        </>
      )}
    </PanelGroup>
  );
};

export default DesktopPanelLayout;
