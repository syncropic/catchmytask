import { AuthPage } from "@refinedev/mantine";
import { useGo } from "@refinedev/core";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { getProviders } from "next-auth/react";
import { getServerSession } from "next-auth/next";
// import { GetServerSideProps } from "next";
// import { authProvider } from "src/authProvider";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useIsAuthenticated } from "@refinedev/core";
import { authOptions } from "../api/auth/[...nextauth]";

export default function Login() {
  const { data: session } = useSession();
  const go = useGo();
  const { isLoading, data: isAuthenticatedData } = useIsAuthenticated();

  const content = session ? (
    <>
      <p className="mb-4 text-lg text-gray-700">
        Signed in as {session?.user?.email}
      </p>
      <button
        onClick={() => signOut()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign out
      </button>
    </>
  ) : (
    <>
      <p className="mb-4 text-lg text-gray-700">Not signed in</p>
      <button
        onClick={() => signIn()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Sign in
      </button>
    </>
  );

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="p-6 max-w-sm w-full bg-white rounded-lg shadow-md">
        {content}
      </div>
    </div>
  );
}

Login.noLayout = true;

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: "/" } };
  }

  const providers = await getProviders();

  return {
    props: { providers: providers ?? [] },
  };
}
