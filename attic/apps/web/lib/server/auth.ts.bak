import { cookies } from "next/headers"

export type Session = { sub: string; email: string } | null

export function readSessionCookieName(): string {
  const n = process.env.SESSION_COOKIE_NAME || "ibx_session"
  return n
}

function decodeBase64Tolerant(value: string): any | null {
  if (!value) return null
  const candidates: string[] = []
  candidates.push(value)
  let v = value.replace(/-/g, "+").replace(/_/g, "/")
  while (v.length % 4) v += "="
  candidates.push(v)
  for (const c of candidates) {
    try {
      const json = Buffer.from(c, "base64").toString("utf8")
      const obj = JSON.parse(json)
      return obj
    } catch {}
  }
  return null
}

export async function getSession(): Promise<Session> {
  const name = readSessionCookieName()
  const jar = await cookies()
  const raw = jar.get(name)?.value || ""
  if (!raw) return null
  const obj = decodeBase64Tolerant(raw)
  if (!obj || typeof obj !== "object") return null
  const sub = typeof (obj as any).sub === "string" ? (obj as any).sub : ""
  const email = typeof (obj as any).email === "string" ? (obj as any).email : ""
  if (!sub || !email) return null
  return { sub, email }
}

export async function requireSession(): Promise<Session> {
  const s = await getSession()
  return s
}

export async function requireAuth() {
  const user = await getSession()
  if (!user) throw new Error("unauthorized")
  return { user }
}
