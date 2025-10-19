import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/server/prisma"
import { env } from "@/lib/server/env"
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (env.NS4_PERSIST === "0") {
    return NextResponse.json({ ok: true, data: { totals: { income: 0, deductions: 0, tax: 0, withholdings: 0, result: 0 }, openUnsureCount: 0, canFile: true }, meta: { mock: true } })
  }
  const answers = await prisma.answer.findMany({ where: { returnId: params.id } })
  const data = Object.fromEntries(answers.map(a=>[a.section, a.data]))
  const withholdings = Number(data?.income?.salary?.withholdings||0)
  const income = Number(data?.income?.salary?.gross||0)
  const deductions = Number(data?.deductions?.total||0)
  const tax = Math.max(income - deductions, 0) * 0.2
  const result = Math.round((withholdings - tax)*100)/100
  const openUnsureCount = await prisma.unsureFlag.count({ where: { returnId: params.id, status: "open" } })
  const canFile = openUnsureCount === 0
  return NextResponse.json({ ok: true, data: { totals: { income, deductions, tax, withholdings, result }, openUnsureCount, canFile } })
}
