// // pages/[...nextauth].js
// import NextAuth from "next-auth";
// import KeycloakProvider from "next-auth/providers/keycloak";

// export const authOptions = {
//   // Configure one or more authentication providers
//   providers: [
//     KeycloakProvider({
//       clientId: process.env.KEYCLOAK_CLIENT_ID,
//       clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
//       issuer: process.env.KEYCLOAK_ISSUER,
//       authorization: { params: { scope: "openid" } },
//     }),
//   ],
//   pages: {
//     signIn: "/login", // Custom sign-in page
//   },
//   callbacks: {
//     async signIn({ user, account, profile, email, credentials }) {
//       // console.log("signIn:", user, account, profile, email, credentials);
//       return true;
//     },
//     async jwt({ token, user, account, profile, isNewUser }) {
//       // console.log("jwt:", token);
//       return token;
//     },
//     async jwt({ token, account }) {
//       // Persist the OAuth access_token to the token right after signin
//       if (account) {
//         token.account = account;
//         // console.log("account:", account);
//       }
//       return token;
//     },
//     async session({ session, token, user }) {
//       // Send properties to the client, like an access_token from a provider.
//       session.token = token;
//       return session;
//     },
//     async redirect({ url, baseUrl }) {
//       //Allows relative callback URLs
//       if (url.startsWith("/")) return `${baseUrl}${url}`;
//       // Allows callback URLs on the same origin
//       else if (new URL(url).origin === baseUrl) return url;
//       return baseUrl;
//     },
//   },
// };

// export default NextAuth(authOptions);
// pages/api/auth/[...nextauth].ts
// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export const authOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: { params: { scope: "openid" } },
    }),
  ],
  pages: {
    signIn: "/login", // Custom sign-in page
    signOut: "/login", // Redirect to login page after signout
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // console.log("signIn:", user, account, profile, email, credentials);
      return true;
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.account = account;
      }
      return token;
    },
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token from a provider.
      session.token = token;
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  events: {
    async signOut({ token, session }) {
      try {
        // Get the ID Token from the token object
        const idToken = token?.account?.id_token;

        // Construct the Keycloak logout URL
        const issuerUrl = process.env.KEYCLOAK_ISSUER;
        const logoutUrl = `${issuerUrl}/protocol/openid-connect/logout`;

        // Make a request to Keycloak's logout endpoint
        if (idToken) {
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
