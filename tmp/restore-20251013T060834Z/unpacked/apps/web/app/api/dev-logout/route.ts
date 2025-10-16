import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL("/", req.url);
  const res = NextResponse.redirect(url);
  res.cookies.set("session", "", { path: "/", expires: new Date(0), sameSite: "lax" });
  return res;
}
