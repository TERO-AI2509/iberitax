export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { clearSession } from "../../../../lib/server/auth";

export async function GET() {
  const res = NextResponse.json({ ok: true, expired: true });
  clearSession(res);
  return res;
}

export async function POST() {
  const res = NextResponse.json({ ok: true, expired: true });
  clearSession(res);
  return res;
}
