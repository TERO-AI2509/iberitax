import { envSnapshot, getStripePublicKey, getStripeSecretKey, getGoogleClientId } from "@/lib/server/env.server"

describe("env.server accessors", () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = { ...OLD_ENV }
    delete process.env.STRIPE_PUBLIC_KEY
    delete process.env.STRIPE_SECRET_KEY
    delete process.env.GOOGLE_CLIENT_ID
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it("returns undefineds when not set", () => {
    expect(getStripePublicKey()).toBeUndefined()
    expect(getStripeSecretKey()).toBeUndefined()
    expect(getGoogleClientId()).toBeUndefined()
    expect(envSnapshot()).toEqual({
      STRIPE_PUBLIC_KEY: undefined,
      STRIPE_SECRET_KEY: undefined,
      GOOGLE_CLIENT_ID: undefined,
    })
  })

  it("reads values when set", () => {
    process.env.STRIPE_PUBLIC_KEY = "pk_test_123"
    process.env.STRIPE_SECRET_KEY = "sk_test_456"
    process.env.GOOGLE_CLIENT_ID = "google-abc.apps.googleusercontent.com"

    expect(getStripePublicKey()).toBe("pk_test_123")
    expect(getStripeSecretKey()).toBe("sk_test_456")
    expect(getGoogleClientId()).toBe("google-abc.apps.googleusercontent.com")
  })
})
