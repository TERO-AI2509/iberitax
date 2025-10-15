import { NextResponse } from "next/server";
import { signValue } from "../../../lib/server/cookies";

export async function GET() {
  const sample = signValue("secret", '{"ping":true}');
  return NextResponse.json({ ok: typeof sample === "string" });
}
