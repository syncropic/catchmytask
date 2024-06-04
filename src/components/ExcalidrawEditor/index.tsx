import React, { use, useEffect, useState } from "react";
import { Anchor, Text } from "@mantine/core";
import { useAppStore } from "src/store";
import { useGo } from "@refinedev/core";
import { IFieldConfigurationWithValue } from "@components/interfaces";
import { getFileArrayBufferById } from "@components/Utils";
import dynamic from "next/dynamic";
const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

const ExcalidrawEditor: React.FC<IFieldConfigurationWithValue> = ({
  value,
  record,
  display_format,
  display_component,
  display_component_content,
}) => {
  // const { activeApplication, setActiveSession, activeRecord } = useAppStore();

  return (
    <>
      <h5 style={{ textAlign: "left" }}>Visual Input</h5>
      <div style={{ height: "400px" }}>
        <Excalidraw />
      </div>
    </>
  );
};

export default ExcalidrawEditor;
