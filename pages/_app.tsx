import { NotificationsProvider } from "@mantine/notifications";
import { AuthBindings, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { notificationProvider } from "@refinedev/mantine";
import routerProvider, { DocumentTitleHandler } from "@refinedev/nextjs-router";
import type { NextPage } from "next";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { accessControlProvider } from "src/access-control-provider";
import BaseLayout from "src/components/Layout";
import defaultApiDataProvider from "../src/default-api-provider";
import "../styles/globals.css";

const API_URL = `${process.env.NEXT_PUBLIC_CMT_API_BASEURL}`;

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
  // const instanceKey1 = `${process.env.NEXT_PUBLIC_DB_NAMESPACE}:${process.env.NEXT_PUBLIC_DB_DATABASE}`;
  // const dbInstance1 = useDb(instanceKey1);
  // const instanceKey2 = `${process.env.NEXT_PUBLIC_DB_NAMESPACE_SECOND}:${process.env.NEXT_PUBLIC_DB_DATABASE_SECOND}`;
  // const dbInstance2 = useDb(instanceKey2);
  // console.log("instanceKey1", instanceKey1);
  // console.log("dbInstance1", dbInstance1);
  // console.log("instanceKey2", instanceKey2);
  // console.log("dbInstance2", dbInstance2);
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
              // default: defaultApiDataProvider(API_URL, dbInstance1),
              // catchmyvibeApiDataProvider: catchmyvibeApiDataProvider(
              //   API_URL,
              //   dbInstance2
              // ),
              // catchmytaskApiDataProvider: catchmytaskApiDataProvider(
              //   API_URL,
              //   dbInstance1
              // ),
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
                name: "datasets",
                list: "/datasets",
                create: "/datasets/create",
                edit: "/datasets/edit/:id",
                show: "/datasets/show/:id",
                clone: "/datasets/clone/:id",
                meta: {
                  credentials: "surrealdb_catchmytask",
                  query_language: "surrealql",
                },
              },
              {
                name: "applications",
                list: "/applications",
                create: "/applications/create",
                edit: "/applications/edit/:id",
                show: "/applications/show/:id",
              },

              {
                name: "sessions",
                list: "/sessions",
                create: "/:applicationId/sessions/create",
                edit: "/:applicationId/sessions/:id/edit",
                show: "/:applicationId/sessions/:id",
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
                  credentials: "surrealdb_catchmytask",
                  query_language: "surrealql",
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
