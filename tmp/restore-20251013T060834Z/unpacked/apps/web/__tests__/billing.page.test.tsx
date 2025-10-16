import React from "react"
import { render, screen } from "@testing-library/react"
import BillingPage from "@/app/billing/page"

jest.mock("@/lib/session", () => ({
  isLoggedIn: jest.fn(),
  isPro: jest.fn(),
}))
import { isLoggedIn, isPro } from "@/lib/session"

const hasText = (re: RegExp) => (_: string, node: Element | null) =>
  !!node && re.test((node.textContent || "").replace(/\s+/g, " ").trim())

describe("BillingPage plan state", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(isLoggedIn as jest.Mock).mockReturnValue(true)
  })

  it("shows Free plan by default", async () => {
    ;(isPro as jest.Mock).mockReturnValue(false)
    const ui = await BillingPage({} as any)
    render(ui as any)
    const matches = screen.getAllByText(hasText(/Plan:\s*Free/i))
    expect(matches.length).toBeGreaterThan(0)
  })

  it("shows Pro active when isPro() is true", async () => {
    ;(isPro as jest.Mock).mockReturnValue(true)
    const ui = await BillingPage({} as any)
    render(ui as any)
    const matches = screen.getAllByText(hasText(/Plan:\s*Pro active/i))
    expect(matches.length).toBeGreaterThan(0)
  })
})
