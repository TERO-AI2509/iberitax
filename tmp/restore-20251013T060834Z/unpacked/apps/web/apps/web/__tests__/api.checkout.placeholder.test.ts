/**
 * @jest-environment node
 */
import { POST } from "@/app/api/checkout/placeholder/route"
import { requireAuth } from "@/lib/server/auth"

jest.mock("@/lib/server/auth", () => ({
  requireAuth: jest.fn()
}))

describe("POST /api/checkout/placeholder", () => {
  it("returns 401 when unauthenticated", async () => {
    ;(requireAuth as jest.Mock).mockRejectedValueOnce(new Error("unauthorized"))
    const res = await POST()
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.error?.code).toBe("unauthorized")
  })

  it("returns ok:true and test sessionId when authenticated", async () => {
    ;(requireAuth as jest.Mock).mockResolvedValueOnce({ user: { id: "u_123" } })
    const res = await POST()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.data.sessionId).toMatch(/^test_/)
    expect(body.data.userId).toBe("u_123")
  })
})
