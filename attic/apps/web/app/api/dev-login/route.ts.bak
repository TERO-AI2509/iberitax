import { NextResponse } from "next/server";

export async function POST() {
  const payload = { sub: "dev@example.com", email: "dev@example.com" };
  const b64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  const cookieName = process.env.SESSION_COOKIE_NAME || "ibx_session";
  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookieName, b64, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}

export async function GET() {
  return new NextResponse("Use POST", { status: 405 });
}
