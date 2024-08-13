import ListView from "@components/ListView";
import ResourceHeader from "@components/ResourceHeader";
import { IListItem, IView } from "@components/interfaces";
import { Accordion, Text } from "@mantine/core";
import { IResourceComponentsProps } from "@refinedev/core";
// import ShortcutList from "pages/shortcuts/index";
import React from "react";
import { useAppStore } from "src/store";
// import ListSessions from "pages/sessions";
// import SessionBar from "@components/SessionBar";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const { activeApplication } = useAppStore();

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex justify-center items-center">
        <Text>Get Important Things Done!</Text>
      </div>
    </div>
  );
};

export default PageList;
