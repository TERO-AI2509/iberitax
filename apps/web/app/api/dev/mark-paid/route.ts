import { NextResponse } from "next/server";
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("paid", "true", { httpOnly: false, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  return res;
}
