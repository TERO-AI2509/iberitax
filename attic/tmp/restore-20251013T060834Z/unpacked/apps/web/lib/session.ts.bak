import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

export async function getSession() {
  const session = await getServerSession(authOptions);
  return session;
}

export async function isLoggedIn() {
  const session = await getSession();
  return !!session?.user?.email;
}

export async function isPro() {
  const session = await getSession();
  const plan = (session as any)?.user?.["plan"];
  return plan === "pro" || plan === "paid" || plan === "premium";
}
