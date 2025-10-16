import type { NextApiRequest, NextApiResponse } from 'next'

const base = process.env.TERO_LAWYER_API_BASE!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const path = req.query.path
  const url = new URL(`${base}/${Array.isArray(path) ? path.join('/') : path ?? ''}`)
  const method = req.method || 'GET'
  const headers: Record<string,string> = { accept: 'application/json' }
  const ct = req.headers['content-type']
  if (ct) headers['content-type'] = String(ct)

  const r = await fetch(url.toString(), {
    method,
    headers,
    body: ['GET','HEAD'].includes(method) ? undefined : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
  })

  const text = await r.text()
  res.status(r.status)
  for (const [k,v] of r.headers.entries()) res.setHeader(k, v)
  res.send(text)
}
