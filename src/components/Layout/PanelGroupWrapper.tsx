// PanelGroupWrapper.tsx
import React from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import ResizeHandle from "@components/ResizeHandle";

const PanelGroupWrapper = ({
  children = [],
}: {
  children: React.ReactNode | React.ReactNode[];
}) => (
  <PanelGroup direction="horizontal">
    {Array.isArray(children) &&
      children.map((child, index) => (
        <>
          <Panel key={`panel-${index}`} defaultSize={30} minSize={10}>
            {child}
          </Panel>
          {index < children.length - 1 && (
            <PanelResizeHandle>
              <ResizeHandle />
            </PanelResizeHandle>
          )}
        </>
      ))}
  </PanelGroup>
);

export default PanelGroupWrapper;
