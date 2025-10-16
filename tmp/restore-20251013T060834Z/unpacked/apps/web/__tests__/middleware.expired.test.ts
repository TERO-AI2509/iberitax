import { describe, it, expect, jest } from "@jest/globals"

// Force an expired token for any token check you may do
jest.mock("next-auth/jwt", () => ({
  __esModule: true,
  getToken: jest.fn(async () => ({ exp: 0 })),
}))

import { middleware } from "../middleware"

// Use a plain WHATWG Request; middleware.ts falls back to req.url when nextUrl is absent
function makeReq(url: string) {
  return new Request(url, { headers: { host: "localhost:3000" } as any })
}

describe("private path without session redirects with reason=expired", () => {
  it("redirects to /login with reason=expired", () => {
    const req = makeReq("http://localhost:3000/account")
    const res = middleware(req as any)
    expect((res as any).status).toBe(307)
    const location = (res as any).headers.get("location") || ""
    expect(location.includes("/login?reason=expired&next=")).toBe(true)
  })
})
