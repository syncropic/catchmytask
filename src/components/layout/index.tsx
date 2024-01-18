import React from "react";
import { CanAccess, Authenticated } from "@refinedev/core";
import { useIsAuthenticated } from "@refinedev/core";
import { useParsed } from "@refinedev/core";

const Layout = ({
  children,
  noAuth,
}: {
  children: React.ReactNode;
  noAuth?: boolean;
}) => {
  const { isLoading, data } = useIsAuthenticated();
  const parsed = useParsed();

  if (isLoading) {
    return <>Loading...</> || null;
  }

  // if not authenticated and url is not /login
  if (!data?.authenticated && parsed?.pathname == "/login") {
    return <>{children}</>;
  }

  return (
    <Authenticated key="dashboard" redirectOnFail="/login">
      {children}
    </Authenticated>
  );
};

export default Layout;
