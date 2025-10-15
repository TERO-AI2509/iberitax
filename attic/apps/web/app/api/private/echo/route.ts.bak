import { NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const raw = req.headers.get("cookie") || "";
  const parsed = Object.fromEntries(
    raw.split(";").map(s => s.trim()).filter(Boolean).map(s => {
      const i = s.indexOf("=");
      return i > 0 ? [s.slice(0,i), decodeURIComponent(s.slice(i+1))] : [s, ""];
    })
  );
  return NextResponse.json({ cookieHeader: raw, parsed });
}
