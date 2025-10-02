import { NextResponse } from "next/server";

export async function POST() {
  const cookieName = process.env.SESSION_COOKIE_NAME || "ibx_session";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
