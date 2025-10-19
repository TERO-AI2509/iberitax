export const runtime = "nodejs"
import { NextResponse } from "next/server"
import { apiGetTree } from "@/lib/api"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params?.id
    if (!id) return NextResponse.json({ error: "missing return id" }, { status: 400 })

    // apiGetTree returns { path, label, children: [...] }
    const tree = await apiGetTree(id)

    // Frontend code tolerates either `items` or `children`
    return NextResponse.json({ items: tree.children ?? [], root: tree })
  } catch (e: any) {
    console.error("[questionnaire/tree] error:", e)
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}
