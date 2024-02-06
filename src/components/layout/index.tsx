import React from "react";
import { CanAccess, Authenticated } from "@refinedev/core";
import { useIsAuthenticated } from "@refinedev/core";
import { useParsed } from "@refinedev/core";
import { Modal } from "@mantine/core";
import { useAppStore } from "src/store";

const Layout = ({
  children,
  noAuth,
}: {
  children: React.ReactNode;
  noAuth?: boolean;
}) => {
  const { isLoading, data } = useIsAuthenticated();
  const parsed = useParsed();
  const {
    actionType,
    setActionType,
    activeViews,
    setActiveViews,
    opened: global_opened,
    setOpened,
  } = useAppStore();
  {
    /* */
  }

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

  return (
    <Authenticated key="dashboard" redirectOnFail="/login">
      {/* <Modal
        opened={global_opened}
        onClose={setOpened(false)}
        title="Send Message"
      >
        <div>hello</div>
      </Modal> */}
      {children}
    </Authenticated>
  );
};

export default Layout;
