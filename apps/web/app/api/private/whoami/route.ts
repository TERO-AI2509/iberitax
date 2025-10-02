import type { NextRequest } from "next/server"

type Ok<T> = { ok: true; data: T }
function jsonOk<T>(data: T): Ok<T> { return { ok: true, data } }

export async function GET(req: NextRequest | Request) {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 3600
  const expiringSoon = exp - now <= 300

  const body = jsonOk({
    email: "demo@example.com",
    now,
    exp,
    expiringSoon,
  })

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}
