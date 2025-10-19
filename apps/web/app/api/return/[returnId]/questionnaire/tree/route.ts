import { NextResponse } from "next/server";
import { modelo100Tree } from "@/lib/questionnaire/tree.modelo100";

export async function GET() {
  return NextResponse.json({ tree: modelo100Tree });
}
