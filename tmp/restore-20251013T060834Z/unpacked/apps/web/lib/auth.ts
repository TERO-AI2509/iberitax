import "server-only";
import type { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import * as nodemailer from "nodemailer";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./db";

const providers: NextAuthOptions["providers"] = [
  EmailProvider({
    from: process.env["EMAIL_FROM"],
    async sendVerificationRequest({ identifier, url, provider }) {
      const emailServer = (process.env["EMAIL_SERVER"] || "").trim();
      const useStream = emailServer.toLowerCase() === "stream";
      const transporter = useStream
        ? nodemailer.createTransport({ streamTransport: true, newline: "unix", buffer: true })
        : nodemailer.createTransport({ url: emailServer });
      const info = await transporter.sendMail({
        to: identifier,
        from: provider.from,
        subject: "Your TERO Fiscal sign-in link",
        text: `Sign in to TERO Fiscal:\n${url}\n\nThis link expires in 15 minutes.`,
        html: `<p>Sign in to <strong>TERO Fiscal</strong>:</p><p><a href="${url}">${url}</a></p><p>This link expires in 15 minutes.</p>`,
      });
      const anyInfo = info as any;
      if (!anyInfo?.messageId) throw new Error("Failed to send magic link email");
      if (useStream) console.log("DEV MAGIC LINK:", url);
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt" },
};
