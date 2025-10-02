import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { jsonEnvelope } from "@/lib/server/jsonEnvelope"
import { requireAuth } from "@/lib/server/auth"

export async function POST() {
  try {
    const { user } = await requireAuth()
    const sessionId = "test_" + crypto.randomBytes(8).toString("hex")
    return NextResponse.json(jsonEnvelope({ ok: true, data: { sessionId, userId: user.id } }), { status: 200 })
  } catch (err: any) {
    return NextResponse.json(jsonEnvelope({ ok: false, error: { code: "unauthorized", hint: "Login required" } }), { status: 401 })
  }
}
