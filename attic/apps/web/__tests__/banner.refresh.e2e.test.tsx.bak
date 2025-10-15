import React from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthStateProvider, useAuthState } from "@/lib/client/authState"

const SOON_ENVELOPE = {
  ok: true,
  data: {
    user: { id: "u1", email: "demo@example.com", name: "Demo" },
    session: { exp: Date.now() + 5_000, expiringSoon: true, status: "expiringSoon" },
  },
}

const REFRESH_OK = {
  ok: true,
  data: {
    user: { id: "u1", email: "demo@example.com", name: "Demo" },
    session: { exp: Date.now() + 60_000, expiringSoon: false, status: "ok" },
  },
}

function MiniUI() {
  const s = useAuthState()
  return (
    <div>
      {s.status === "expiringSoon" && <div>Session will expire soon</div>}
      <button onClick={() => s.refresh()}>Refresh session</button>
      <div data-testid="status">{s.status}</div>
    </div>
  )
}

describe("Session refresh flow (self-contained UI)", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  test("clicking Refresh session returns to ok", async () => {
    const fetchMock = jest.spyOn(global, "fetch")

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(SOON_ENVELOPE), { status: 200, headers: { "content-type": "application/json" } })
    )

    render(
      <AuthStateProvider initial={{ status: "checking" }}>
        <MiniUI />
      </AuthStateProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/session will expire soon/i)).toBeInTheDocument()
      expect(screen.getByTestId("status").textContent).toBe("expiringSoon")
    })

    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(REFRESH_OK), { status: 200, headers: { "content-type": "application/json" } })
    )
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(REFRESH_OK), { status: 200, headers: { "content-type": "application/json" } })
    )

    await userEvent.click(screen.getByRole("button", { name: /refresh session/i }))

    await waitFor(() => {
      expect(screen.queryByText(/session will expire soon/i)).not.toBeInTheDocument()
      expect(screen.getByTestId("status").textContent).toBe("ok")
    })
  })
})
