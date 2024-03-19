import { useAuthToken } from "@components/Utils";
import { IApplication } from "@components/interfaces";
import { Accordion } from "@mantine/core";
import {
  Authenticated,
  HttpError,
  useIsAuthenticated,
  useOne,
  useParsed,
} from "@refinedev/core";
import { IconAffiliate, IconTableShortcut } from "@tabler/icons-react";
import ActionControl from "pages/action_control/create";
import SessionList from "pages/sessions";
// import ShortcutList from "pages/shortcuts";
import React, { useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ThemedHeaderV2 } from "src/components/Layout/header";
import { useAppStore } from "src/store";

function InitializeApplication({
  activeApplicationId,
  children,
}: {
  activeApplicationId: string;
  children: React.ReactNode;
}) {
  // const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  // const { action, isLoading, error } = useFetchActionById(
  //   activeActionId?.id || ""
  // );
  const {
    data: applicationData,
    isLoading: isLoadingApplication,
    isError: isErrorApplication,
  } = useOne<IApplication, HttpError>({
    resource: "applications",
    id: `${activeApplicationId}`,
  });
  const { setActiveApplication } = useAppStore();

  // console.log("action", applicationData);
  const application = applicationData?.data;
  useEffect(() => {
    if (application) {
      setActiveApplication(application);
    }
  }, [applicationData?.data]);

  if (isLoadingApplication) {
    return <>Loading...</> || null;
  }

  if (isErrorApplication) {
    return <>{JSON.stringify(isErrorApplication)}</>;
  }

  return <div>{children}</div>;
}

const Layout = ({
  children,
  noAuth,
}: {
  children: React.ReactNode;
  noAuth?: boolean;
}) => {
  const { isLoading, data } = useIsAuthenticated();
  const { token, loading, error } = useAuthToken();
  const parsed = useParsed();
  const { activeLayout, setActiveApplication } = useAppStore();
  // const {
  //   data: applicationData,
  //   isLoading: isLoadingApplication,
  //   isError: isErrorApplication,
  // } = useOne<IApplication, HttpError>({
  //   resource: "applications",
  //   id: `applications:⟨018e21b1-0bfe-7048-ab46-2b39f5f8091c⟩`,
  // });

  // const application = applicationData?.data;
  // when session changes, set activeDataset
  // useEffect(() => {
  //   if (application) {
  //     setActiveApplication(application);
  //   }
  // }, [applicationData?.data]);

  if (isLoading) {
    return <>Loading...</> || null;
  }
  // error handling
  if (error) {
    return <>{JSON.stringify(error)}</>;
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
    <Authenticated key="home" redirectOnFail="/login">
      <InitializeApplication
        activeApplicationId={`applications:⟨018e21b1-0bfe-7048-ab46-2b39f5f8091c⟩`}
      >
        <ThemedHeaderV2 sticky={true} />
        <PanelGroup direction="horizontal">
          {activeLayout?.leftSection?.isDisplayed && (
            <Panel defaultSize={20} minSize={0} id="left">
              <div
                className="overflow-auto h-screen"
                style={{ height: "calc(100vh - 64px)" }}
              >
                <Accordion defaultValue="quick_access">
                  <Accordion.Item key="quick_access" value="quick_access">
                    <Accordion.Control icon={<IconTableShortcut size={16} />}>
                      Quick Access
                    </Accordion.Control>
                    <Accordion.Panel>
                      {/* <ShortcutList /> */}
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
              </div>
            </Panel>
          )}
          {activeLayout?.centerSection?.isDisplayed && (
            <>
              <PanelResizeHandle className="w-1 bg-gray-500" id="left" />
              <Panel defaultSize={60} minSize={30} id="middle">
                <div
                  className="overflow-auto h-screen"
                  style={{ height: "calc(100vh - 64px)" }}
                >
                  {children}
                </div>
              </Panel>
            </>
          )}
          {activeLayout?.rightSection?.isDisplayed && (
            <>
              <PanelResizeHandle className="w-1 bg-gray-500" id="middle" />
              <Panel defaultSize={20} minSize={0} id="right">
                <div
                  className="overflow-auto h-screen"
                  style={{ height: "calc(100vh - 64px)" }}
                >
                  <ActionControl />
                </div>
              </Panel>
            </>
          )}
        </PanelGroup>
      </InitializeApplication>
    </Authenticated>
  );
};

export default Layout;
