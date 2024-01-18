import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    // GoogleProvider({
    //   clientId:
    //     "547172291738-07p9t0ll2d50sv44et91tg62iseao6bb.apps.googleusercontent.com",
    //   clientSecret: "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",
    // }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      name: "Microsoft",
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      //Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

export default NextAuth(authOptions);
