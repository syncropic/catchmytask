import { GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { Container } from "@mantine/core";
import {
  RefineThemes,
  ThemedLayoutV2,
  notificationProvider,
  ThemedTitleV2,
  ThemedSiderV2,
  ThemedHeaderV2,
} from "@refinedev/mantine";
import routerProvider, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/nextjs-router";
import type { NextPage } from "next";
import { AppProps } from "next/app";
import { SessionProvider, useSession, signOut, signIn } from "next-auth/react";
import BaseLayout from "src/components/layout";

import { Header } from "@components/header";
import {
  Box,
  Button,
  ColorScheme,
  ColorSchemeProvider,
  Global,
  MantineProvider,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
// import dataProvider from "@refinedev/simple-rest";
// import { authProvider } from "src/authProvider";
import defaultApiDataProvider from "../src/default-api-provider";
import catchmyvibeApiDataProvider from "../src/catchmyvibe-api-provider";
import catchmytaskApiDataProvider from "../src/catchmytask-api-provider";
import onewurldDataProvider from "../src/onewurld-provider";
import initializeCatchmytaskDb from "src/catchmytask-api-provider/db";
import initializeCatchmyvibeDb from "src/catchmyvibe-api-provider/db";
import initializeDefaultDb from "src/default-api-provider/db";
// import initializeOnewurldDb from "src/onewurld-provider/db";
import "../styles/globals.css";
import { useRouter } from "next/router";
import { AuthBindings } from "@refinedev/core";
import { CustomSider } from "@components/sider";
import { CustomTitle } from "@components/title";
import { accessControlProvider } from "src/access-control-provider";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

// ... rest of your _app.js or _app.tsx file

const API_URL = "https://api.fake-rest.refine.dev";
const ONEWURLD_API_URL = "http://localhost";
const CATCHMYTASK_API_URL = "http://localhost";

const initializeDefaultDbInstance = initializeDefaultDb({
  namespace: "catchmytask",
  database: "catchmytask",
  username: "catchmytask",
  password: "ao6xjEh#55Ojjkawe&C0Kdv",
});

const catchmytaskDbInstance = initializeCatchmytaskDb({
  namespace: "catchmytask",
  database: "catchmytask",
  username: "catchmytask",
  password: "ao6xjEh#55Ojjkawe&C0Kdv",
});

const catchmyvibeDbInstance = initializeCatchmyvibeDb({
  namespace: "catchmyvibe",
  database: "catchmyvibe",
  username: "catchmyvibe",
  password: "ao6xjEh#55Ojj!!F&C0Kdv",
});

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  noLayout?: boolean;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export type ExtendedNextPage = NextPage & {
  noLayout?: boolean;
};

type ExtendedAppProps = AppProps & {
  Component: ExtendedNextPage;
};

const App = (props: React.PropsWithChildren) => {
  const { data, status } = useSession();
  const router = useRouter();
  const { to } = router.query;

  if (status === "loading") {
    return <span>loading...</span>;
  }

  const authProvider: AuthBindings = {
    login: async ({ providerName, email, password }) => {
      if (providerName) {
        signIn(providerName, {
          callbackUrl: to ? to.toString() : "/",
          redirect: true,
        });
        return {
          success: true,
        };
      }

      const signInResponse = await signIn("CredentialsSignIn", {
        email,
        password,
        callbackUrl: to ? to.toString() : "/",
        redirect: false,
      });

      if (!signInResponse) {
        return {
          success: false,
        };
      }

      const { ok, error } = signInResponse;

      if (ok) {
        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: new Error(error?.toString()),
      };
    },
    register: async ({ providerName, email, password }) => {
      if (providerName) {
        signIn(providerName, {
          callbackUrl: to ? to.toString() : "/",
          redirect: true,
        });

        return {
          success: true,
        };
      }

      const signUpResponse = await signIn("CredentialsSignUp", {
        email,
        password,
        callbackUrl: to ? to.toString() : "/",
        redirect: false,
      });

      if (!signUpResponse) {
        return {
          success: false,
        };
      }

      const { ok, error } = signUpResponse;

      if (ok) {
        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: new Error(error?.toString()),
      };
    },
    updatePassword: async (params) => {
      if (params.password === "demodemo") {
        //we can update password here
        return {
          success: true,
          redirectTo: "/login",
        };
      }
      return {
        success: false,
        error: {
          message: "Update password failed",
          name: "Invalid password",
        },
      };
    },
    forgotPassword: async (params) => {
      if (params.email === "demo@refine.dev") {
        //we can send email with reset password link here
        return {
          success: true,
          redirectTo: "/login",
        };
      }
      return {
        success: false,
        error: {
          message: "Forgot password failed",
          name: "Invalid email",
        },
      };
    },
    logout: async () => {
      signOut({
        redirect: true,
        callbackUrl: "/login",
      });

      return {
        success: true,
      };
    },
    onError: async (error) => {
      console.error(error);
      return {
        error,
      };
    },
    check: async () => {
      if (status === "unauthenticated") {
        return {
          authenticated: false,
          redirectTo: "/login",
        };
      }

      return {
        authenticated: true,
      };
    },
    getPermissions: async () => {
      return null;
    },
    getIdentity: async () => {
      if (data?.user) {
        const { user } = data;
        return {
          name: user.name,
          avatar: user.image,
        };
      }

      return null;
    },
  };
  return (
    <>
      <NotificationsProvider position="top-right">
        <Refine
          routerProvider={routerProvider}
          dataProvider={{
            default: defaultApiDataProvider(API_URL),
            catchmyvibeApiDataProvider: catchmyvibeApiDataProvider(API_URL),
            onewurldProvider: onewurldDataProvider(ONEWURLD_API_URL),
            catchmytaskApiDataProvider:
              catchmytaskApiDataProvider(CATCHMYTASK_API_URL),
          }}
          notificationProvider={notificationProvider}
          authProvider={authProvider}
          accessControlProvider={accessControlProvider}
          resources={[
            {
              name: "dashboard",
              list: "/dashboards",
              create: "/dashboards/create",
              edit: "/dashboards/edit/:id",
              show: "/dashboards/show/:id",
              meta: {
                canDelete: true,
              },
            },
            {
              name: "task",
              list: "/tasks",
              create: "/tasks/create",
              edit: "/tasks/edit/:id",
              show: "/tasks/show/:id",
              meta: {
                canDelete: true,
                dataProviderName: "default",
              },
            },
            // {
            //   name: "automations",
            //   list: "/automations",
            //   create: "/automations/create",
            //   edit: "/automations/edit/:id",
            //   show: "/automations/show/:id",
            //   meta: {
            //     canDelete: true,
            //   },
            // },
            // {
            //   name: "schedule_changes",
            //   list: "/schedule_changes",
            //   create: "/schedule_changes/create",
            //   edit: "/schedule_changes/edit/:id",
            //   show: "/schedule_changes/show/:id",
            //   meta: {
            //     canDelete: true,
            //   },
            // },
            {
              name: "onewurld_bookings",
              list: "/onewurld_bookings",
              create: "/onewurld_bookings/create",
              edit: "/onewurld_bookings/edit/:id",
              show: "/onewurld_bookings/show/:id",
              meta: {
                canDelete: true,
                dataProviderName: "onewurldProvider",
              },
            },
            // {
            //   name: "onewurld_subscriptions",
            //   list: "/onewurld_subscriptions",
            //   create: "/onewurld_subscriptions/create",
            //   edit: "/onewurld_subscriptions/edit/:id",
            //   show: "/onewurld_subscriptions/show/:id",
            //   meta: {
            //     canDelete: true,
            //     dataProviderName: "onewurldProvider",
            //   },
            // },
            {
              name: "caesars_bookings",
              list: "/caesars_bookings",
              create: "/caesars_bookings/create",
              edit: "/caesars_bookings/edit/:id",
              show: "/caesars_bookings/show/:id",
              meta: {
                canDelete: true,
                dataProviderName: "default",
              },
            },
            // {
            //   name: "knowledge_items",
            //   list: "/knowledge_items",
            //   create: "/knowledge_items/create",
            //   edit: "/knowledge_items/edit/:id",
            //   show: "/knowledge_items/show/:id",
            //   meta: {
            //     canDelete: true,
            //   },
            // },
            // {
            //   name: "summaries",
            //   list: "/summaries",
            //   create: "/summaries/create",
            //   edit: "/summaries/edit/:id",
            //   show: "/summaries/show/:id",
            //   meta: {
            //     canDelete: true,
            //   },
            // },
            {
              name: "reports",
              list: "/reports",
              create: "/reports/create",
              edit: "/reports/edit/:id",
              show: "/reports/show/:id",
              meta: {
                canDelete: true,
                dataProviderName: "default",
              },
            },
            // {
            //   name: "functions",
            //   list: "/functions",
            //   create: "/functions/create",
            //   edit: "/functions/edit/:id",
            //   show: "/functions/show/:id",
            //   meta: {
            //     canDelete: true,
            //     dataProviderName: "default",
            //   },
            // },
            // {
            //   name: "sets",
            //   list: "/sets",
            //   create: "/sets/create",
            //   edit: "/sets/edit/:id",
            //   show: "/sets/show/:id",
            //   meta: {
            //     canDelete: true,
            //     dataProviderName: "catchmyvibeApiDataProvider",
            //   },
            // },
            // {
            //   name: "calculators",
            //   list: "/calculators",
            //   create: "/calculators/create",
            //   edit: "/calculators/edit/:id",
            //   show: "/calculators/show/:id",
            //   meta: {
            //     canDelete: true,
            //   },
            // },
            // {
            //   name: "execute",
            //   list: "/executes",
            //   create: "/executes/create",
            //   edit: "/executes/edit/:id",
            //   show: "/executes/show/:id",
            //   meta: {
            //     canDelete: true,
            //   },
            // },
            {
              name: "music",
              list: "/music",
              create: "/music/create",
              edit: "/music/edit/:id",
              show: "/music/show/:id",
              meta: {
                canDelete: true,
                dataProviderName: "catchmyvibeApiDataProvider",
              },
            },
            // {
            //   name: "artist",
            //   list: "/artist",
            //   create: "/artist/create",
            //   edit: "/artist/edit/:id",
            //   show: "/artist/show/:id",
            //   meta: {
            //     canDelete: true,
            //     dataProviderName: "catchmyvibeApiDataProvider",
            //   },
            // },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            projectId: "OpGcqe-gAGTnn-eW9pDg",
          }}
        >
          <BaseLayout>{props.children}</BaseLayout>
          <UnsavedChangesNotifier />
          <DocumentTitleHandler />
        </Refine>
      </NotificationsProvider>
    </>
  );
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: ExtendedAppProps): JSX.Element {
  const renderComponent = () => {
    if (Component.noLayout) {
      return <Component {...pageProps} />;
    }

    // const demoProps = {
    //   bg: "var(--mantine-color-blue-light)",
    //   h: 50,
    //   mt: "xl",
    // };

    return (
      // <div className="container max-w-screen-2xl mx-auto">
      //   <div className="flex flex-col min-h-screen">
      <ThemedLayoutV2
        Header={() => <ThemedHeaderV2 sticky={true} />}
        Sider={() => (
          <ThemedSiderV2
            Title={({ collapsed }) => (
              <ThemedTitleV2
                // collapsed is a boolean value that indicates whether the <Sidebar> is collapsed or not
                collapsed={collapsed}
                icon={collapsed ? <div>Stormy</div> : <div></div>}
                text="Stormy"
              />
            )}
            render={({ items, logout, collapsed }) => {
              return (
                <>
                  {items}
                  {logout}
                </>
              );
            }}
          />
        )}
        // Footer={() => (
        //   <Box
        //     sx={{
        //       display: "flex",
        //       alignItems: "center",
        //       justifyContent: "center",
        //       width: "100%",
        //       height: "64px",
        //       backgroundColor: "primary.main",
        //     }}
        //   >
        //     stormy
        //   </Box>
        // )}
        // OffLayoutArea={() => (
        //   <Button
        //     // size="small"
        //     // color="primary"
        //     sx={{
        //       position: "fixed",
        //       bottom: "16px",
        //       left: "36px",
        //     }}
        //     // onClick={() => alert("Off layout are clicked")}
        //     // variant="extended"
        //   >
        //     Chat 👋
        //   </Button>
        // )}
      >
        <div className="flex justify-center">
          <div className="w-[1260px]">
            <Component {...pageProps} />
          </div>
        </div>
        {/* <PanelGroup direction="horizontal">
          <Panel defaultSize={30} minSize={20}>
            left
          </Panel>
          <PanelResizeHandle />
          <Panel minSize={30}>middle</Panel>
          <PanelResizeHandle />
          <Panel defaultSize={30} minSize={20}>
            right
          </Panel>
        </PanelGroup> */}
      </ThemedLayoutV2>
      //   </div>
      // </div>
    );
  };

  return (
    <SessionProvider session={session}>
      <App>{renderComponent()}</App>
    </SessionProvider>
  );
}

export default MyApp;

// return (
//   <>
//     <SessionProvider session={session}>
//       <RefineKbarProvider>
//         <ColorSchemeProvider
//           colorScheme={colorScheme}
//           toggleColorScheme={toggleColorScheme}
//         >
//           {/* You can change the theme colors here. example: theme={{ ...RefineThemes.Magenta, colorScheme:colorScheme }} */}
//           <MantineProvider
//             theme={{ ...RefineThemes.Blue, colorScheme: colorScheme }}
//             withNormalizeCSS
//             withGlobalStyles
//           >
//             <Global styles={{ body: { WebkitFontSmoothing: "auto" } }} />
//             <NotificationsProvider position="top-right">
//               <DevtoolsProvider>
//                 <Refine
//                   routerProvider={routerProvider}
//                   dataProvider={dataProvider(API_URL)}
//                   notificationProvider={notificationProvider}
//                   authProvider={authProvider}
//                   resources={[
//                     {
//                       name: "task",
//                       list: "/tasks",
//                       create: "/tasks/create",
//                       edit: "/tasks/edit/:id",
//                       show: "/tasks/show/:id",
//                       meta: {
//                         canDelete: true,
//                       },
//                     },
//                     {
//                       name: "schedule_change",
//                       list: "/schedule_changes",
//                       create: "/schedule_changes/create",
//                       edit: "/schedule_changes/edit/:id",
//                       show: "/schedule_changes/show/:id",
//                       meta: {
//                         canDelete: true,
//                       },
//                     },
//                     {
//                       name: "report",
//                       list: "/reports",
//                       create: "/reports/create",
//                       edit: "/reports/edit/:id",
//                       show: "/reports/show/:id",
//                       meta: {
//                         canDelete: true,
//                       },
//                     },
//                     {
//                       name: "dashboard",
//                       list: "/dashboards",
//                       create: "/dashboards/create",
//                       edit: "/dashboards/edit/:id",
//                       show: "/dashboards/show/:id",
//                       meta: {
//                         canDelete: true,
//                       },
//                     },
//                   ]}
//                   options={{
//                     syncWithLocation: true,
//                     warnWhenUnsavedChanges: true,
//                     projectId: "OpGcqe-gAGTnn-eW9pDg",
//                   }}
//                 >
//                   {renderComponent()}
//                   <RefineKbar />
//                   <UnsavedChangesNotifier />
//                   <DocumentTitleHandler />
//                 </Refine>
//                 <DevtoolsPanel />
//               </DevtoolsProvider>
//             </NotificationsProvider>
//           </MantineProvider>
//         </ColorSchemeProvider>
//       </RefineKbarProvider>
//     </SessionProvider>
//   </>
// );
