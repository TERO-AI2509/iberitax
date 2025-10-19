import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: NextRequest, { params }: { params: { returnId: string } }) {
  const { acknowledgeUnsure } = await req.json().catch(()=>({}))
  const open = await prisma.unsureFlag.count({ where: { returnId: params.returnId, status: "open" } })
  if (open > 0 && !acknowledgeUnsure) {
    return NextResponse.json(
      { ok: false, errors: [{ code: "UNSURE_OPEN", message: "Some items are marked unsure. Upload docs or acknowledge to proceed." }] },
      { status: 400 }
    )
  }
  if (open > 0 && acknowledgeUnsure) {
    await prisma.unsureFlag.updateMany({ where: { returnId: params.returnId, status: "open" }, data: { status: "waived" } })
  }
  return NextResponse.json({ ok: true, data: { submitted: true, reference: `TF-${Date.now()}` } })
}
