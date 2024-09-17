// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    token?: any; // Extend the session object to include a token field of type `any`
    accessToken?: string; // You can keep this or other custom properties as needed
    error?: string;
  }

  interface JWT {
    token?: any; // Extend the JWT object to include a token field of type `any`
    accessToken?: string; // Keep or add other custom properties if needed
  }
}
