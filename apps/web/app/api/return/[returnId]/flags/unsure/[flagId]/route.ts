import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
export async function PATCH(req: NextRequest, { params }: { params: { id: string, flagId: string } }) {
  const { status } = await req.json()
  const row = await prisma.unsureFlag.update({ where: { id: params.flagId }, data: { status, resolvedAt: status === "resolved" ? new Date() : null } })
  return NextResponse.json({ ok: true, data: row })
}
