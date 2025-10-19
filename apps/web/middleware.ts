import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
const buckets = new Map<string, { n: number; t: number }>()
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/client/")) {
    const ip = req.ip || "0"
    const now = Date.now()
    const b = buckets.get(ip) || { n: 0, t: now }
    const windowMs = 2000
    if (now - b.t > windowMs) { b.n = 0; b.t = now }
    b.n += 1
    buckets.set(ip, b)
    if (b.n > 15) return new NextResponse(null, { status: 404 })
  }
  return NextResponse.next()
}
export const config = { matcher: ["/client/:path*"] }
