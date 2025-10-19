import { NextResponse } from "next/server"
import { prisma } from "@/apps/web/lib/db/prisma"
export async function POST() {
  return NextResponse.json({ ok: true })
}
