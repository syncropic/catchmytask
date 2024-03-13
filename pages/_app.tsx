import { NotificationsProvider } from "@mantine/notifications";
import { AuthBindings, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { notificationProvider } from "@refinedev/mantine";
import routerProvider, { DocumentTitleHandler } from "@refinedev/nextjs-router";
import { IconDashboard } from "@tabler/icons-react";
import type { NextPage } from "next";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { accessControlProvider } from "src/access-control-provider";
import initializeCatchmytaskDb from "src/catchmytask-api-provider/db";
import initializeCatchmyvibeDb from "src/catchmyvibe-api-provider/db";
import BaseLayout from "src/components/Layout";
import initializeDefaultDb from "src/default-api-provider/db";
import catchmytaskApiDataProvider from "../src/catchmytask-api-provider";
import catchmyvibeApiDataProvider from "../src/catchmyvibe-api-provider";
import defaultApiDataProvider from "../src/default-api-provider";
import onewurldDataProvider from "../src/onewurld-provider";
import "../styles/globals.css";

const API_URL = "https://api.fake-rest.refine.dev";

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
          email: user.email,
          // ...user,
        };
      }

      return null;
    },
  };

  return (
    <>
      <DevtoolsProvider>
        <NotificationsProvider position="top-right">
          <Refine
            routerProvider={routerProvider}
            dataProvider={{
              default: defaultApiDataProvider(API_URL),
              // catchmytaskGraphqlApiDataProvider:
              //   catchmytaskGraphqlApiDataProvider(graphqlClient),
              catchmyvibeApiDataProvider: catchmyvibeApiDataProvider(API_URL),
              onewurldProvider: onewurldDataProvider(
                `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}`
              ),
              catchmytaskApiDataProvider: catchmytaskApiDataProvider(
                `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}`
              ),
            }}
            notificationProvider={notificationProvider}
            authProvider={authProvider}
            accessControlProvider={accessControlProvider}
            resources={[
              {
                name: "home",
                list: "/home",
              },
              {
                name: "profile",
                list: "/profile",
              },
              {
                name: "applications",
                list: "/applications",
                create: "/applications/create",
                edit: "/applications/edit/:id",
                show: "/applications/show/:id",
                clone: "/applications/clone/:id",
                // meta: {
                //   canDelete: true,
                //   // icon: <IconDashboard />,
                // },
              },
              {
                name: "sessions",
                list: "/sessions",
                create: "/sessions/create",
                edit: "/sessions/edit/:id",
                show: "/sessions/show/:id",
                clone: "/sessions/clone/:id",
                // meta: {
                //   canDelete: true,
                //   // icon: <IconDashboard />,
                // },
              },
              {
                name: "general",
                list: "/general",
                create: "/general/create",
                edit: "/general/edit/:id",
                show: "/general/show/:id",
                clone: "/general/clone/:id",
                // meta: {
                //   canDelete: true,
                //   // icon: <IconDashboard />,
                // },
              },

              {
                name: "query",
                list: "/query",
                create: "/query/create",
                edit: "/query/edit/:id",
                show: "/query/show/:id",
                meta: {
                  canDelete: true,
                  hide: true,
                  dataProviderName: "catchmytaskApiDataProvider",
                },
              },
              {
                name: "action_control",
                list: "/action_control",
                create: "/action_control/create",
                edit: "/action_control/edit/:id",
                show: "/action_control/show/:id",
                meta: {
                  canDelete: true,
                  hide: true,
                  dataProviderName: "catchmytaskApiDataProvider",
                },
              },

              {
                name: "shortcuts",
                list: "/shortcuts",
                create: "/shortcuts/create",
                edit: "/shortcuts/edit/:id",
                show: "/shortcuts/show/:id",
                meta: {
                  canDelete: true,
                  hide: true,
                  // dataProviderName: "catchmyvibeApiDataProvider",
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              projectId: "OpGcqe-gAGTnn-eW9pDg",
            }}
          >
            <BaseLayout>{props.children}</BaseLayout>
            {/* <UnsavedChangesNotifier /> */}
            <DocumentTitleHandler />
            <DevtoolsPanel />
          </Refine>
        </NotificationsProvider>
      </DevtoolsProvider>
    </>
  );
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: ExtendedAppProps): JSX.Element {
  // const renderComponent = () => {
  //   if (Component.noLayout) {
  //     return <Component {...pageProps} />;
  //   }

  //   return (
  //     <>
  //       <Component {...pageProps} />
  //     </>
  //   );
  // };

  return (
    <SessionProvider session={session}>
      <App>
        <Component {...pageProps} />
      </App>
    </SessionProvider>
  );
}

export default MyApp;
