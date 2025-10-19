import { NextResponse } from "next/server"
import { requireSession } from "@/lib/auth/requireSession"
export async function POST(req: Request) {
  await requireSession()
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get("clientId") || ""
  const forward = process.env.STRIPE_CHECKOUT_URL
  if (!forward) {
    const err: any = new Error("Stripe forward URL not configured")
    err.status = 500
    throw err
  }
  const resp = await fetch(`${forward}?clientId=${encodeURIComponent(clientId)}`, { method: "POST" })
  const json = await resp.json()
  return NextResponse.json(json)
}
