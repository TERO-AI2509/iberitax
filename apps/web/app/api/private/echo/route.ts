import { NextResponse } from 'next/server';
import { requireSession } from '../../../../lib/server/session';
export async function GET() {
  const r = await requireSession();
  if (!r.ok) return new NextResponse('Unauthorized', { status: r.status });
  return NextResponse.json({ ok:true, method:'GET' });
}
export async function POST(req: Request) {
  const r = await requireSession();
  if (!r.ok) return new NextResponse('Unauthorized', { status: r.status });
  try {
    const body = await req.json().catch(() => ({}));
    return NextResponse.json({ ok:true, method:'POST', body });
  } catch {
    return new NextResponse('Bad Request', { status: 400 });
  }
}
