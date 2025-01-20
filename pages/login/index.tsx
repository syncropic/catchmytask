import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getServerSession } from "next-auth/next";
import {
  getProviders,
  LiteralUnion,
  ClientSafeProvider,
  signIn,
  signOut,
  useSession,
} from "next-auth/react";
import { useIsAuthenticated } from "@refinedev/core";
import { BuiltInProviderType } from "next-auth/providers";
import { authOptions } from "../api/auth/[...nextauth]";
import { Button } from "@mantine/core";

type LoginProps = {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  > | null;
};

export default function Login({
  providers,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { data: session } = useSession();
  const { isLoading, data: isAuthenticatedData } = useIsAuthenticated();
  const { data: user_session } = useSession();

  const content = session ? (
    <div className="text-center">
      <p className="mb-6 text-gray-800 text-lg">
        Signed in as{" "}
        <span className="font-semibold">{session?.user?.email}</span>
      </p>
      <Button
        gradient={{ from: "blue", to: "cyan", deg: 105 }}
        variant="gradient"
        fullWidth
        onClick={() => signOut()}
      >
        Sign out
      </Button>
    </div>
  ) : (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800 text-center">
        Welcome
      </h1>
      <div className="mt-6 space-y-4">
        {providers &&
          Object.values(providers).map((provider) => (
            <div key={provider.name}>
              <Button
                gradient={{ from: "blue", to: "cyan", deg: 90 }}
                variant="gradient"
                fullWidth
                onClick={() => signIn(provider.id)}
              >
                Sign In
              </Button>
            </div>
          ))}
      </div>
    </div>
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        {content}
      </div>
    </div>
  );
}

Login.noLayout = true;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const user_session = await getServerSession(
    context.req,
    context.res,
    authOptions
  );

  let is_invalid_token = Boolean(
    user_session?.userProfile?.detail &&
      typeof user_session.userProfile.detail === "string" &&
      user_session.userProfile.detail.includes(
        "Invalid authentication credentials"
      )
  );

  // If the user is already logged in, redirect to the homepage.
  if (user_session && !is_invalid_token) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: (providers as LoginProps["providers"]) ?? null },
  };
}
