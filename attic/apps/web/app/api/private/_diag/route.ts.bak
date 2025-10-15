import { NextResponse } from "next/server"
import { getSession, readSessionCookieName } from "@/lib/server/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getSession()
  return NextResponse.json({
    ok: true,
    hasSession: Boolean(session),
    user: session ?? null,
    cookie: readSessionCookieName(),
  })
}
