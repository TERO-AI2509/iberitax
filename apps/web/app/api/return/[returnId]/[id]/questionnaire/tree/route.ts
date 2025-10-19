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

function fallbackTree(){return{path:"/overview",label:"Overview",children:[{path:"/personal",label:"Personal data"},{path:"/family",label:"Family",children:[{path:"/family/marital",label:"Marital status"},{path:"/family/children",label:"Children"},{path:"/family/disability",label:"Disability"},{path:"/family/dependents",label:"Elderly or other dependents"}]},{path:"/income",label:"Income",children:[{path:"/income/salary",label:"Salary"},{path:"/income/investments",label:"Investments",children:[{path:"/income/investments/securities",label:"Securities"},{path:"/income/investments/funds",label:"Funds"},{path:"/income/investments/dividends",label:"Dividends"},{path:"/income/investments/interest",label:"Interest"}]},{path:"/income/rental",label:"Rental income"},{path:"/income/business",label:"Self-employed/Business"},{path:"/income/capital-gains",label:"Capital gains"}]},{path:"/deductions",label:"Deductions",children:[{path:"/deductions/housing",label:"Housing",children:[{path:"/deductions/housing/owner",label:"Owner"},{path:"/deductions/housing/tenant",label:"Tenant"},{path:"/deductions/housing/mortgage",label:"Mortgage"}]},{path:"/deductions/donations",label:"Donations"},{path:"/deductions/pension",label:"Pension plans"},{path:"/deductions/education",label:"Education"}]},{path:"/summary",label:"Summary"}]};}
