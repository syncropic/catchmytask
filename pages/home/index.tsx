import { IResourceComponentsProps } from "@refinedev/core";
// import ListApplications from "pages/applications/index";
import ShortcutList from "pages/shortcuts/index";
import React from "react";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  return (
    <>
      {/* <ListApplications /> */}
      <ShortcutList />
    </>
  );
};
export default PageList;
