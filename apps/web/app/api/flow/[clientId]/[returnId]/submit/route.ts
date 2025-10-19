import { NextResponse } from "next/server"
import { ownership } from "@/lib/db/ownership"
import { enforceOwnership } from "@/lib/guards/ownership"
import { prisma } from "@/lib/db/prisma"
export async function POST(_: Request, { params }: { params: { clientId: string, returnId: string } }) {
  await enforceOwnership(ownership, params.clientId, params.returnId)
  await prisma.return_.update({ where: { id: params.returnId }, data: { status: "locked" } })
  return NextResponse.json({ ok: true })
}
