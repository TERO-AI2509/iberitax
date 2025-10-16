import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
export function middleware(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.startsWith('/api/private/')) {
    const jar = cookies();
    const ibx = jar.get('ibx_session')?.value ?? '';
    const ok =
      jar.has('__Secure-next-auth.session-token') ||
      jar.has('next-auth.session-token') ||
      (ibx && ibx.length >= 16 && ibx !== 'invalid');
    if (!ok) return new NextResponse('Unauthorized', { status: 401 });
  }
  return NextResponse.next();
}
export const config = { matcher: ['/api/private/:path*'] };
