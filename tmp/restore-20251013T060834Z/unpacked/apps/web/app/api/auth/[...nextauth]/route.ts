import NextAuth from "next-auth";
import { redirectCallback } from '@/lib/authRedirect';
import { authOptions } from "@/lib/auth";

/**
 * Extend authOptions and set a shared secret explicitly so middleware getToken()
 * and NextAuth decrypt the same JWT.
 */
const handler = NextAuth({
  ...authOptions,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    ...(authOptions.callbacks || {}),
    async redirect({ url, baseUrl }) {
      try {
        if (url.startsWith("/")) {
          return new URL(url, baseUrl).toString();
        }
        const target = new URL(url);
        const base = new URL(baseUrl);
        if (target.origin === base.origin) {
          return target.toString();
        }
      } catch {}
      return new URL("/dashboard", baseUrl).toString();
    },
  },
});

export { handler as GET, handler as POST };
