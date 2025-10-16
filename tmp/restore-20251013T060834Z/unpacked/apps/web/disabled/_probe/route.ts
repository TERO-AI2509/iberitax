import { NextResponse } from "next/server";
import { signValue } from "../../lib/server/cookies";

export async function GET() {
  const ok = typeof signValue === "function";
  return NextResponse.json({ ok });
}
