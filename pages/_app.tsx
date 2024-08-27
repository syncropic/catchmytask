// import { NotificationsProvider } from "@mantine/notifications";
import { Notifications } from "@mantine/notifications";
import { AuthBindings, Refine } from "@refinedev/core";
import { useNotificationProvider } from "@refinedev/mantine";
import routerProvider, { DocumentTitleHandler } from "@refinedev/nextjs-router";
import type { NextPage } from "next";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { accessControlProvider } from "src/access-control-provider";
import BaseLayout from "src/components/Layout";
import defaultApiDataProvider from "../src/default-api-provider";
import { createTheme, MantineProvider } from "@mantine/core";
import config from "src/config";
// core styles are required for all packages
import "@mantine/core/styles.css";
import "@mantine/tiptap/styles.css";
// other css files are required only if
// you are using components from the corresponding package
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";
// import '@mantine/dates/styles.css';
// import '@mantine/dropzone/styles.css';
// import '@mantine/code-highlight/styles.css';
// import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";
import "../styles/globals.css";
// import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { registerLicense } from "@syncfusion/ej2-base";
import { useRuntimeConfig } from "@components/Utils";
import { useAppStore } from "src/store";
import { useEffect } from "react";

// Registering Syncfusion license key
registerLicense(
  "Ngo9BigBOggjHTQxAR8/V1NBaF5cXmZCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWXlfcnRdRGZfU0NyX0o="
);

const theme = createTheme({
  /** Put your mantine theme override here */
});

// const API_URL = config.API_URL;

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
  const fetchRuntimeConfig = useAppStore((state) => state.fetchRuntimeConfig);
  const runtimeConfig = useAppStore((state) => state.runtimeConfig);

  useEffect(() => {
    fetchRuntimeConfig();
  }, [fetchRuntimeConfig]);

  if (status === "loading" || !runtimeConfig) {
    return <span>loading...</span>;
  }

  let API_URL = runtimeConfig?.API_URL;

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
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-right" />
        <Refine
          routerProvider={routerProvider}
          dataProvider={{
            default: defaultApiDataProvider(API_URL),
          }}
          notificationProvider={useNotificationProvider}
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
            },

            {
              name: "sessions",
              list: "/sessions",
              create: "/:applicationId/sessions/create",
              edit: "/:applicationId/sessions/:id/edit",
              show: "/:applicationId/sessions/:id",
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            projectId: "OpGcqe-gAGTnn-eW9pDg",
          }}
        >
          <BaseLayout>{props.children}</BaseLayout>
          {/* <DocumentTitleHandler /> */}
          <ReactQueryDevtools initialIsOpen={false} />
        </Refine>
      </MantineProvider>
    </>
  );
};

function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}: ExtendedAppProps): JSX.Element {
  return (
    <SessionProvider session={session}>
      <App>
        <Component {...pageProps} />
      </App>
    </SessionProvider>
  );
}

export default MyApp;
