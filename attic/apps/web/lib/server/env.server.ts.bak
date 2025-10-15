export function getStripePublicKey(): string | undefined {
  const v = process.env.STRIPE_PUBLIC_KEY?.trim()
  return v || undefined
}
export function getStripeSecretKey(): string | undefined {
  const v = process.env.STRIPE_SECRET_KEY?.trim()
  return v || undefined
}
export function getGoogleClientId(): string | undefined {
  const v = process.env.GOOGLE_CLIENT_ID?.trim()
  return v || undefined
}
export function envSnapshot() {
  return {
    STRIPE_PUBLIC_KEY: getStripePublicKey(),
    STRIPE_SECRET_KEY: getStripeSecretKey(),
    GOOGLE_CLIENT_ID: getGoogleClientId(),
  }
}
// —— Stripe strict accessors (Step 20) ——
export function requireStripeSecretKey(): string {
  const v = process.env.STRIPE_SECRET_KEY?.trim()
  if (!v) throw new Error("Missing STRIPE_SECRET_KEY")
  return v
}

export function requireStripePriceId(): string {
  const v = process.env.STRIPE_PRICE_ID?.trim()
  if (!v) throw new Error("Missing STRIPE_PRICE_ID")
  return v
}

/** test (default) | live */
export function getStripeMode(): "test" | "live" {
  const v = (process.env.STRIPE_MODE || "test").trim().toLowerCase()
  return (v === "live" ? "live" : "test") as "test" | "live"
}
