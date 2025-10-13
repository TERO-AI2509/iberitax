import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthStateProvider, useAuthState } from "@/lib/client/authState";

jest.mock("@/lib/client/fetcher", () => ({
  clientFetch: jest.fn(),
}));

const { clientFetch } = jest.requireMock("@/lib/client/fetcher");

function Probe() {
  const { status, user } = useAuthState();
  return <div data-testid="probe">{status}:{user?.email ?? "null"}</div>;
}

describe.skip("AuthStateProvider", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("sets ok and user on success", async () => {
    clientFetch.mockResolvedValue({ ok: true, data: { user: { id: "u1", email: "a@b.c" } } });
    render(<AuthStateProvider><Probe /></AuthStateProvider>);
    await waitFor(() => expect(screen.getByTestId("probe").textContent).toContain("ok:a@b.c"));
  });

  it("sets expired on 401", async () => {
    clientFetch.mockResolvedValue({ ok: false, status: 401, error: { code: "UNAUTHORIZED", hint: "expired" } });
    render(<AuthStateProvider><Probe /></AuthStateProvider>);
    await waitFor(() => expect(screen.getByTestId("probe").textContent).toContain("expired:null"));
  });

  it("sets offline on network error", async () => {
    clientFetch.mockRejectedValue(new Error("net"));
    render(<AuthStateProvider><Probe /></AuthStateProvider>);
    await waitFor(() => expect(screen.getByTestId("probe").textContent).toContain("offline:null"));
  });
});
