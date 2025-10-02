import { describe, expect, it } from "@jest/globals"
// Adjust this import to wherever your route actually lives:
import { GET } from "../app/api/private/whoami/route"

function mkReq() {
  return new Request("http://localhost/api/private/whoami", { method: "GET" })
}

describe("GET /api/private/whoami", () => {
  it("returns ok envelope for healthy session", async () => {
    const res = await GET(mkReq() as any)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toHaveProperty("ok", true)
  })
})
