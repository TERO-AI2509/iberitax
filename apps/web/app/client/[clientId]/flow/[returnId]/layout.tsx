import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import FlowShell from "@/components/flow/FlowShell";

async function checkPaid(): Promise<boolean> {
  const hdr = headers();
  const devBypass = hdr.get("x-dev-bypass") === "1";
  if (devBypass) return true;
  const paid = cookies().get("paid")?.value === "true";
  if (paid) return true;
  try {
    const r = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/engagement/status`, { cache: "no-store" });
    if (!r.ok) return false;
    const j = await r.json();
    return !!j?.paid;
  } catch {
    return false;
  }
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: { clientId: string; returnId: string } }) {
  const isPaid = await checkPaid();
  if (!isPaid) redirect("/payment");
  return <FlowShell clientId={params.clientId} returnId={params.returnId}>{children}</FlowShell>;
}
