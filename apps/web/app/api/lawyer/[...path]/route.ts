import { NextRequest, NextResponse } from 'next/server'

const base = process.env.TERO_LAWYER_API_BASE!

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const upstream = new URL(`${base}/${(params.path || []).join('/')}`)
  upstream.search = new URL(req.url).search
  const r = await fetch(upstream, { headers: { accept: 'application/json' } })
  return new NextResponse(await r.text(), { status: r.status, headers: r.headers })
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const upstream = new URL(`${base}/${(params.path || []).join('/')}`)
  const r = await fetch(upstream, {
    method: 'POST',
    headers: { 'content-type': req.headers.get('content-type') ?? 'application/json' },
    body: await req.arrayBuffer(),
  })
  return new NextResponse(await r.text(), { status: r.status, headers: r.headers })
}
