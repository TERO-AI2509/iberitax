import { NextResponse } from "next/server";
const mem: Record<string, any> = {};
export async function GET(req: Request) {
  const url = new URL(req.url);
  const returnId = url.searchParams.get("returnId") || "";
  return NextResponse.json(mem[returnId] || {});
}
export async function POST(req: Request) {
  const body = await req.json();
  const returnId = String(body.returnId || "");
  const updates = body.updates || {};
  const prev = mem[returnId] || {};
  const next = { ...prev, ...updates };
  mem[returnId] = next;
  return NextResponse.json({ ok: true, data: next });
}
