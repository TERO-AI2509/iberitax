import { NextResponse } from "next/server"
import { getSession } from "@/lib/server/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: "unauthorized", hint: "Login required" } },
      { status: 401 }
    )
  }
  return NextResponse.json({ ok: true, data: { user } }, { status: 200 })
}
