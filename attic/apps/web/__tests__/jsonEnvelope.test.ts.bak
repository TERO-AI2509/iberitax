import { jsonEnvelope } from "../lib/http/jsonEnvelope";

describe("jsonEnvelope", () => {
  it("wraps data", async () => {
    const res = jsonEnvelope({ data: { ok: true } });
    expect(res.status).toBe(200);
    const j = await res.json();
    expect(j.ok).toBe(true);
    expect(j.data.ok).toBe(true);
  });

  it("wraps error", async () => {
    const res = jsonEnvelope({ status: 401, error: { code: "UNAUTHORIZED", message: "nope" } });
    expect(res.status).toBe(401);
    const j = await res.json();
    expect(j.ok).toBe(false);
    expect(j.error.code).toBe("UNAUTHORIZED");
  });
});
