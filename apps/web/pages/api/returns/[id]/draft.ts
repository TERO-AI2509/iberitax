import type { NextApiRequest, NextApiResponse } from "next"
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method Not Allowed" })
    return
  }
  res.status(200).json({ ok: true, id, updatedAt: new Date().toISOString(), echo: req.body || null })
}
