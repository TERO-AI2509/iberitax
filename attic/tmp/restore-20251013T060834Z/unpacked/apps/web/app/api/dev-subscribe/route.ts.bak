import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ ok: true, pro: true })
  res.cookies.set("ibx_pro", "1", { httpOnly: false, path: "/", maxAge: 60 * 60 })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true, pro: false })
  res.cookies.set("ibx_pro", "", { httpOnly: false, path: "/", maxAge: 0 })
  return res
}
