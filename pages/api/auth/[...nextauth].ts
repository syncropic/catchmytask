// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { JWT } from "next-auth/jwt";

interface Token extends JWT {
  account?: {
    access_token?: string;
    id_token?: string;
    refresh_token?: string;
    expires_at?: number;
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: { params: { scope: "openid" } },
    }),
  ],
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async jwt({ token, user, account }): Promise<Token> {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.account = account;
      }
      return token;
    },
    async session(props) {
      // Send properties to the client, like an access_token from a provider.
      // console.log(session);
      // console.log(token);
      // console.log(user);
      // console.log(props);
      let session = props?.session;
      session.token = props?.token;
      // console.log(
      //   `access_token ${props?.session?.token?.account?.access_token}`
      // );
      let access_token = props?.session?.token?.account?.access_token;

      // Fetch user permissions after authentication
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/profile`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
      const userProfile = await userResponse.json();
      // console.log(JSON.stringify(userData));
      session.userProfile = userProfile;

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    async signOut({ token }) {
      try {
        const idToken = (token as Token)?.account?.id_token;

        if (idToken && process.env.KEYCLOAK_ISSUER) {
          const logoutUrl = `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/logout`;
          await fetch(
            `${logoutUrl}?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(
              process.env.NEXTAUTH_URL || ""
            )}`
          );
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
