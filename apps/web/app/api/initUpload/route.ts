export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const ORIGIN = process.env.NEXT_PUBLIC_STUB_ORIGIN || 'http://127.0.0.1:4000';

export async function GET() {
  try {
    const r = await fetch(`${ORIGIN}/init-upload`, { cache: 'no-store' });
    const data = await r.json();
    return NextResponse.json(data, { status: r.ok ? 200 : r.status });
  } catch {
    return NextResponse.json({ ok: false, error: 'init failed' }, { status: 500 });
  }
}
