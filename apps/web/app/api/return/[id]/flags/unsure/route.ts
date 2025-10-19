import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const rows = await prisma.unsureFlag.findMany({ where: { returnId: params.id, status: { in: ["open","waived"] } } })
  return NextResponse.json({ ok: true, data: rows })
}
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { section, path, note } = await req.json()
  const row = await prisma.unsureFlag.create({ data: { returnId: params.id, section, path, note } })
  return NextResponse.json({ ok: true, data: row })
}
