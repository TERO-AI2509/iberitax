/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react"

jest.mock("@/lib/session", () => ({
  isLoggedIn: jest.fn().mockResolvedValue(false),
  isPro: jest.fn().mockResolvedValue(false),
}))

const BillingPage = require("@/app/billing/page").default

describe("/billing page guard", () => {
  it("renders not-logged-in message and link when unauthenticated", async () => {
    const ui = await BillingPage({} as any)
    render(ui as any)
    expect(screen.getByText(/You are not signed in\./i)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Sign in/i })).toBeInTheDocument()
  })
})
