import { NextResponse } from "next/server"
import { requireSession } from "@/lib/auth/requireSession"
import { prisma } from "@/lib/db/prisma"
export async function POST() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ ok: false }, { status: 404 })
  let userId = "dev-user"
  try { const s = await requireSession(); if (s?.user?.id) userId = s.user.id } catch {}
  const client = await prisma.client.create({ data: { id: crypto.randomUUID(), userId, name: "Test Client", paid: false } })
  return NextResponse.json({ ok: true, clientId: client.id })
}
