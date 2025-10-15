import { requireStripeSecretKey, requireStripePriceId, getStripeMode } from "@/lib/server/env.server"

describe("env.stripe", () => {
  const env = process.env
  beforeEach(() => {
    process.env = { ...env }
  })
  afterEach(() => {
    process.env = env
  })

  it("reads required keys", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123"
    process.env.STRIPE_PRICE_ID = "price_123"
    expect(requireStripeSecretKey()).toBe("sk_test_123")
    expect(requireStripePriceId()).toBe("price_123")
  })

  it("throws when missing", () => {
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.STRIPE_PRICE_ID
    expect(() => requireStripeSecretKey()).toThrow()
    expect(() => requireStripePriceId()).toThrow()
  })

  it("mode defaults to test", () => {
    delete process.env.STRIPE_MODE
    expect(getStripeMode()).toBe("test")
  })
})
