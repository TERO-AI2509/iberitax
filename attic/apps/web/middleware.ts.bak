import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest | Request) {
  // Support both NextRequest (runtime) and plain Request (tests)
  const nextReq = req as NextRequest & { nextUrl?: URL }
  const urlLike: URL = nextReq.nextUrl ?? new URL((req as any).url)
  const { pathname, search } = urlLike

  // your existing auth logic…
  const hasAuth = (nextReq as any).cookies?.get?.("auth") ?? false

  if (pathname.startsWith("/account") && !hasAuth) {
    const redirectTo = new URL(`/login?reason=expired&next=${pathname}${search}`, urlLike)
    return NextResponse.redirect(redirectTo)
  }

  return NextResponse.next()
}
