import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import { AuthStateProvider, useAuthState } from "@/lib/client/authState"

const OK_ENVELOPE = {
  ok: true,
  data: {
    user: { id: "u1", email: "demo@example.com", name: "Demo" },
    session: { exp: Date.now() + 60_000, expiringSoon: false, status: "ok" },
  },
}

const EXPIRED_ENVELOPE = {
  ok: true,
  data: {
    user: null,
    session: { exp: Date.now() - 1_000, expiringSoon: true, status: "expired" },
  },
}

function Probe() {
  const s = useAuthState()
  return <div data-testid="probe">{s.status}</div>
}

function withAuth(ui: React.ReactNode, opts?: { fetchMock?: Response }) {
  const fm = opts?.fetchMock
  if (fm) jest.spyOn(global, "fetch").mockResolvedValueOnce(fm)
  return <AuthStateProvider initial={{ status: "checking" }}>{ui}</AuthStateProvider>
}

describe("auth guard (hook-level)", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test("status becomes ok when whoami is ok", async () => {
    const fm = new Response(JSON.stringify(OK_ENVELOPE), { status: 200, headers: { "content-type": "application/json" } })
    render(withAuth(<Probe />, { fetchMock: fm }))
    await waitFor(() => {
      expect(screen.getByTestId("probe").textContent).toBe("ok")
    })
  })

  test("status becomes expired when whoami indicates expired", async () => {
    const fm = new Response(JSON.stringify(EXPIRED_ENVELOPE), { status: 200, headers: { "content-type": "application/json" } })
    render(withAuth(<Probe />, { fetchMock: fm }))
    await waitFor(() => {
      expect(screen.getByTestId("probe").textContent).toBe("expiringSoon")
    })
  })
})
