/** @jest-environment jsdom */
import { render, screen, fireEvent } from "@testing-library/react"
import StartTestCheckout from "@/app/billing/StartTestCheckout"

beforeAll(() => {
  // Force the fallback path: ok:false but provide a URL
  // @ts-ignore
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ ok: false, data: { url: "https://checkout.stripe.com/test_123" } })
  })
  // Silence jsdom alert warnings
  // @ts-ignore
  global.alert = jest.fn()
})

test("renders 'Continue to Stripe' fallback link with URL", async () => {
  render(<StartTestCheckout />)
  const btn = await screen.findByRole("button", { name: /start test checkout/i })
  fireEvent.click(btn)
  const link = await screen.findByRole("link", { name: /continue to stripe/i })
  expect(link).toHaveAttribute("href", "https://checkout.stripe.com/test_123")
})
