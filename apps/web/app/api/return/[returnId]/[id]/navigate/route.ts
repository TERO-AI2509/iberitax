import { NextResponse } from "next/server";
const ORDER = ["/income/salary", "/summary"];
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const url = new URL(req.url);
  const current = url.searchParams.get("current") || "";
  const m = current.match(/\/client\/[^/]+\/flow\/[^/]+(\/.*)$/);
  const sub = m ? m[1] : "";
  const idx = ORDER.indexOf(sub);
  const resp: { prevPath?: string; nextPath?: string } = {};
  if (idx > 0) resp.prevPath = current.replace(sub, ORDER[idx - 1]);
  if (idx >= 0 && idx < ORDER.length - 1) resp.nextPath = current.replace(sub, ORDER[idx + 1]);
  return NextResponse.json(resp);
}
