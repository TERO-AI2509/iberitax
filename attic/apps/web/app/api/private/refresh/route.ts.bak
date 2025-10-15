import { NextResponse } from 'next/server'

type Ok<T> = { ok: true; data: T }
function jsonOk<T>(data: T): Ok<T> { return { ok: true, data } }

export async function POST() {
  const now = Math.floor(Date.now() / 1000)
  const thresholdSeconds = 300
  const exp = now + 3600
  return NextResponse.json(jsonOk({
    email: 'demo@example.com',
    now,
    exp,
    thresholdSeconds,
    expiringSoon: false,
  }))
}
