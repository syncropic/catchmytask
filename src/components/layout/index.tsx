import React, { useEffect } from "react";
import { CanAccess, Authenticated, useMenu } from "@refinedev/core";
import { useIsAuthenticated } from "@refinedev/core";
import { useParsed } from "@refinedev/core";
import { Accordion, Box, Modal, ScrollArea } from "@mantine/core";
import { useAppStore } from "src/store";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// import ViewList from "pages/views";
import SessionList from "pages/sessions";
import ShortcutList from "pages/shortcuts";
// import CreateQuery from "pages/query/create";
import ActionControl from "pages/action_control/create";
// import { ThemedHeaderV2 } from "@refinedev/mantine";
import { ThemedHeaderV2 } from "src/components/layout/header";

import {
  IconAffiliate,
  IconList,
  IconSearch,
  IconTableShortcut,
  IconViewfinder,
} from "@tabler/icons-react";
import { useViewportSize } from "@mantine/hooks";

const fetchData = async () => {
  // check if cmt_auth_token is in the local storage if not fetch it
  const auth_token = localStorage.getItem("cmt_auth_token");
  if (auth_token) {
    console.log("Data already in localStorage", JSON.parse(auth_token));
    return;
  }
  try {
    // Use URLSearchParams to construct form-data
    const formData = new URLSearchParams();
    formData.append("username", "johndoe");
    formData.append("password", "secret");

    const response = await fetch("http://localhost/token", {
      method: "POST", // or 'PUT'
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });
    const data = await response.json();
    localStorage.setItem("cmt_auth_token", JSON.stringify(data));
    // console.log("Data saved to localStorage", data);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const Layout = ({
  children,
  noAuth,
}: {
  children: React.ReactNode;
  noAuth?: boolean;
}) => {
  const { isLoading, data } = useIsAuthenticated();
  const parsed = useParsed();
  const { activeLayout } = useAppStore();
  const { selectedKey, menuItems, defaultOpenKeys } = useMenu();
  const { height, width } = useViewportSize();
  // console.log(menuItems);
  // console.log(selectedKey);
  // console.log(defaultOpenKeys);
  // useEffect to log the data when user is successfully authenticated
  useEffect(() => {
    // if (data?.authenticated) {
    //   console.log("isAuthenticatedData", data?.authenticated);
    //   fetchData();
    //   // go("/");
    // }
    if (data?.authenticated === true) {
      console.log("user is authenticated");
      fetchData();
      // make a fetch request to get the user data
      // make post request to /token and save the token in the local storage
    } else {
      console.log("user is not authenticated");
    }
  }, [data?.authenticated]);

  if (isLoading) {
    return <>Loading...</> || null;
  }

  // if not authenticated and url is not /login
  if (!data?.authenticated && parsed?.pathname == "/login") {
    return <>{children}</>;
  }
  // show login button if not authenticated
  if (!data?.authenticated && parsed?.pathname !== "/login") {
    return (
      <>
        <p className="mb-4 text-lg text-gray-700">Not signed in</p>
        <button
          // onClick={() => signIn()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <a href="/login">Sign in</a>
        </button>
      </>
    );
  }
  // Inline style for content to ensure it does not overlap the scrollbar
  // Note: This is more about not causing content to have a higher stacking context
  const contentStyle = {
    zIndex: 0, // Ensure content does not have a higher z-index
  };

  return (
    <Authenticated key="dashboard" redirectOnFail="/login">
      <ThemedHeaderV2 sticky={true} />
      {/* <Modal
        opened={global_opened}
        onClose={setOpened(false)}
        title="Send Message"
      >
        <div>hello</div>
      </Modal> */}
      <PanelGroup direction="horizontal">
        {activeLayout?.leftSection?.isDisplayed && (
          <Panel defaultSize={20} minSize={0}>
            {/* <ScrollArea h={height} scrollbars="y"> */}
            <Accordion defaultValue="quick_access">
              <Accordion.Item key="quick_access" value="quick_access">
                <Accordion.Control icon={<IconTableShortcut size={16} />}>
                  Quick Access
                </Accordion.Control>
                <Accordion.Panel>
                  <ShortcutList />
                  {/* <ViewList /> */}
                  <SessionList />
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item key="query" value="query">
                <Accordion.Control icon={<IconAffiliate size={16} />}>
                  Query
                </Accordion.Control>
                <Accordion.Panel>{/* <CreateQuery /> */}</Accordion.Panel>
              </Accordion.Item>
            </Accordion>
            {/* </ScrollArea> */}
          </Panel>
        )}
        {activeLayout?.centerSection?.isDisplayed && (
          <>
            <PanelResizeHandle className="w-1 bg-gray-500" />
            <Panel defaultSize={60} minSize={30}>
              {/* <ScrollArea h={height}> */}
              {children}
              {/* </ScrollArea> */}
            </Panel>
          </>
        )}
        {activeLayout?.rightSection?.isDisplayed && (
          <>
            <PanelResizeHandle className="w-1 bg-gray-500" />
            <Panel defaultSize={20} minSize={0}>
              {/* <ScrollArea h={height}> */}
              <ActionControl />
              {/* </ScrollArea> */}
            </Panel>
          </>
        )}
      </PanelGroup>
    </Authenticated>
  );
};

export default Layout;
