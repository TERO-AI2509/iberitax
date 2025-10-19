import { NextResponse } from "next/server";
export async function GET(_: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({
    items: [
      { title: "Income", path: "/income", children: [
        { title: "Salary", path: "/income/salary" }
      ]},
      { title: "Summary", path: "/summary" }
    ]
  });
}
