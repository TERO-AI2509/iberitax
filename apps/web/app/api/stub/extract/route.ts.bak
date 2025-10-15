import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const r = await fetch("http://127.0.0.1:4000/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    const json = await r.json();
    return NextResponse.json(json, { status: r.status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, errors: [String(e?.message || e)] }, { status: 500 });
  }
}
