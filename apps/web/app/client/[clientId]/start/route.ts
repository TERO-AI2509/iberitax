import { NextResponse } from "next/server"
import { ownership } from "@/lib/db/ownership"
import { enforceOwnership } from "@/lib/guards/ownership"
import { prisma } from "@/lib/db/prisma"
export async function GET(_: Request, { params }: { params: { clientId: string } }) {
  const { clientId } = params
  await enforceOwnership(ownership, clientId)
  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client?.paid) {
    const notAllowed: any = new Error("Not Found")
    notAllowed.status = 404
    throw notAllowed
  }
  const ret = await prisma.return_.create({ data: { id: crypto.randomUUID(), clientId, status: "draft" } })
  return NextResponse.redirect(new URL(`/client/${clientId}/flow/${ret.id}/overview`, process.env.NEXT_PUBLIC_BASE_URL))
}
