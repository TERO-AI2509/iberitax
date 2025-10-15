export async function GET(req: Request, { params }: { params: { slug: string[] } }) {
  const base = process.env.LAWYER_API_BASE || 'http://localhost:8787';
  const path = '/api/lawyer/' + (params.slug || []).join('/');
  const upstream = new URL(path, base).toString();
  const r = await fetch(upstream, { method: 'GET', headers: { accept: req.headers.get('accept') || '*' } });
  const body = await r.text();
  return new Response(body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'text/plain' } });
}
export async function POST(req: Request, { params }: { params: { slug: string[] } }) {
  const base = process.env.LAWYER_API_BASE || 'http://localhost:8787';
  const path = '/api/lawyer/' + (params.slug || []).join('/');
  const upstream = new URL(path, base).toString();
  const init = { method: 'POST', headers: { 'content-type': req.headers.get('content-type') || 'application/json' }, body: await req.text() };
  const r = await fetch(upstream, init as any);
  const body = await r.text();
  return new Response(body, { status: r.status, headers: { 'content-type': r.headers.get('content-type') || 'application/json' } });
}
