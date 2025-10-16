import { NextResponse } from "next/server";
import { requireSessionForApi } from "../../../../lib/server/auth";
import { setSignedSessionCookie } from "../../../../lib/server/cookies";
export async function POST() {
  const s = requireSessionForApi();
  if (s instanceof Response) return s;
  const res = NextResponse.json({ ok: true, rotated: true });
  setSignedSessionCookie({ email: s.email, sub: s.sub, iat: Math.floor(Date.now()/1000) }, res);
  return res;
}
