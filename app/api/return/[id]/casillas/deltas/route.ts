import { NextResponse } from "next/server";
export async function GET(req: Request, { params }: { params: { id: string } }) {
  return NextResponse.json([
    { casilla: "0001", before: 0, after: 1200 },
    { casilla: "0548", before: 0, after: 300 }
  ]);
}
