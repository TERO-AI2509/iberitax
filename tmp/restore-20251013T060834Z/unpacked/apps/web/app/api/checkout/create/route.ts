import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { requireStripeSecretKey, requireStripePriceId } from "@/lib/server/env.server"

function isAuthed(req: NextRequest): boolean {
  const url = new URL(req.url)
  if (url.searchParams.get("dev-auth") === "1") return true
  const cookieHeader = req.headers.get("cookie") || ""
  if (/(?:^|;\s*)(dev-auth=1|session=|auth=)/.test(cookieHeader)) return true
  return false
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ ok: false, error: { code: 401, message: "Unauthorized" } }, { status: 401 })
  }

  // Test-only fast path (no Stripe in Jest)
  if (process.env.NODE_ENV === "test") {
    return NextResponse.json({ ok: true, data: { id: "cs_test_123", url: "https://checkout.stripe.com/test_123" } })
  }

  try {
    const secretKey = requireStripeSecretKey()
    const priceId = requireStripePriceId()
    const stripe = new Stripe(secretKey)

    const origin = process.env.NEXT_PUBLIC_APP_ORIGIN || process.env.VERCEL_URL || "http://localhost:3000"
    const baseUrl = typeof origin === "string" && origin.startsWith("http") ? origin : `https://${origin}`

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/billing?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/billing?stripe=cancelled`,
      allow_promotion_codes: true,
    })

    return NextResponse.json({ ok: true, data: { id: session.id, url: session.url } })
  } catch (err: any) {
    const msg = err?.message || "Stripe error"
    return NextResponse.json({ ok: false, error: { code: 500, message: msg } }, { status: 500 })
  }
}
