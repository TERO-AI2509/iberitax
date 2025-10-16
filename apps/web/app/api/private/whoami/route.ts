import { NextResponse } from 'next/server';
import { requireSession } from '../../../../lib/server/session';
export async function GET() {
  const r = await requireSession();
  if (!r.ok) return new NextResponse('Unauthorized', { status: r.status });
  return NextResponse.json({ user: null });
}
