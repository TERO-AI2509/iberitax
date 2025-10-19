export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { apiGetTree } from "@/lib/api";

/**
 * GET /api/return/:id/questionnaire/tree
 * Returns { items: [...], root: {...} }.
 * Never throws: on any error, falls back to a minimal static tree so the UI still loads.
 */
export async function GET(_req: Request, ctx: { params: { id: string } }) {
  try {
    const id = ctx?.params?.id;
    if (!id) return NextResponse.json({ error: "missing return id" }, { status: 400 });

    let tree: any;
    try {
      tree = await apiGetTree(id);
    } catch (e) {
      console.error("[questionnaire/tree] apiGetTree failed; using fallback:", e);
      tree = fallbackTree();
    }

    return NextResponse.json({ items: tree.children ?? [], root: tree });
  } catch (e: any) {
    console.error("[questionnaire/tree] fatal:", e);
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}

function fallbackTree() {
  return {
    path: "/overview",
    label: "Overview",
    children: [
      { path: "/personal", label: "Personal data" },
      {
        path: "/family",
        label: "Family",
        children: [
          { path: "/family/marital", label: "Marital status" },
          { path: "/family/children", label: "Children" },
          { path: "/family/disability", label: "Disability" },
          { path: "/family/dependents", label: "Elderly or other dependents" },
        ],
      },
      { path: "/income", label: "Employment income", children: [{ path: "/income/salary", label: "Salary" }] },
      { path: "/summary", label: "Summary" },
    ],
  };
}
