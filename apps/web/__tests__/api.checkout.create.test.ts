/** @jest-environment node */
import { NextRequest } from "next/server"

// Inline factory; no external refs (avoids TDZ)
jest.mock("stripe", () => {
  const create = jest.fn().mockResolvedValue({
    id: "cs_test_123",
    url: "https://checkout.stripe.com/test_123",
  })
  const Default = function Stripe() {
    return { checkout: { sessions: { create } } }
  }
  return { __esModule: true, default: Default }
})

import { POST } from "@/app/api/checkout/create/route"

function makeReq(authed: boolean) {
  const url = authed
    ? "http://localhost/api/checkout/create?dev-auth=1"
    : "http://localhost/api/checkout/create"
  const init: any = { method: "POST" }
  return new NextRequest(url, init)
}

describe("/api/checkout/create", () => {
  const OLD_ENV = process.env
  beforeEach(() => {
    process.env = {
      ...OLD_ENV,
      STRIPE_SECRET_KEY: "sk_test_123",
      STRIPE_PRICE_ID: "price_123",
      NEXT_PUBLIC_APP_ORIGIN: "http://localhost:3000",
    }
  })
  afterEach(() => {
    process.env = OLD_ENV
  })

  it("returns ok:true with id and url", async () => {
    const res = await POST(makeReq(true) as any)
    const json = await (res as any).json()
    expect(json.ok).toBe(true)
    expect(json.data.id).toBe("cs_test_123")
    expect(json.data.url).toContain("checkout.stripe.com")
  })

  it("401 when unauthenticated", async () => {
    const res = await POST(makeReq(false) as any)
    expect((res as any).status).toBe(401)
  })
})
