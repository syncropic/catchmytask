import ListView from "@components/ListView";
import ResourceHeader from "@components/ResourceHeader";
import { IListItem, IView } from "@components/interfaces";
import { Accordion, Text } from "@mantine/core";
import { IResourceComponentsProps } from "@refinedev/core";
// import ShortcutList from "pages/shortcuts/index";
import React from "react";
import { useAppStore } from "src/store";
import ListSessions from "pages/sessions";
import SessionBar from "@components/SessionBar";

export const PageList: React.FC<IResourceComponentsProps> = () => {
  const { activeApplication } = useAppStore();

  return (
    <SessionBar
      name={activeApplication?.name}
      heading={activeApplication?.heading}
      subheading={activeApplication?.subheading}
      description={activeApplication?.description}
    />
    // <div className="flex flex-col gap-3">
    //   <ResourceHeader
    //     name={activeApplication?.name}
    //     heading={activeApplication?.heading}
    //     subheading={activeApplication?.subheading}
    //     description={activeApplication?.description}
    //   />

    //   {activeApplication?.show ? (
    //     <Accordion defaultValue="1">
    //       {activeApplication?.show?.map((item: IView) => (
    //         <Accordion.Item key={item?.order} value={item?.order?.toString()}>
    //           <Accordion.Control>{`${item?.resource}`}</Accordion.Control>
    //           <Accordion.Panel>
    //             <ListView item={item} />
    //           </Accordion.Panel>
    //         </Accordion.Item>
    //       ))}
    //     </Accordion>
    //   ) : (
    //     <ListSessions />
    //   )}
    // </div>
  );
};
export default PageList;
