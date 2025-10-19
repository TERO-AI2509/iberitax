import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"
import { env } from "@/lib/server/env"
export async function GET(_: NextRequest, { params }: { params: { id: string, section: string } }) {
  if (env.NS4_PERSIST === "0") return NextResponse.json({ ok: true, data: {}, meta: { mock: true } })
  const row = await prisma.answer.findUnique({ where: { returnId_section: { returnId: params.id, section: params.section } } })
  return NextResponse.json({ ok: true, data: row?.data ?? {}, meta: { schemaVersion: "2025-10-NS4" } })
}
export async function PATCH(req: NextRequest, { params }: { params: { id: string, section: string } }) {
  const body = await req.json().catch(()=>({}))
  if (env.NS4_PERSIST === "0") return NextResponse.json({ ok: true, data: body?.patch ?? {}, meta: { mock: true } })
  const existing = await prisma.answer.upsert({
    where: { returnId_section: { returnId: params.id, section: params.section } },
    update: { data: { ...( (await prisma.answer.findUnique({ where: { returnId_section: { returnId: params.id, section: params.section } } }))?.data || {}), ...(body?.patch||{}) }, version: { increment: 1 } },
    create: { returnId: params.id, section: params.section, data: body?.patch||{} }
  })
  return NextResponse.json({ ok: true, data: existing.data, meta: { schemaVersion: "2025-10-NS4" } })
}
