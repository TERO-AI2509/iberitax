"use client";
import Link from "next/link";
import { useReturnStore } from "@/components/flow/store";
function Status({ s }:{ s?:string }){ return <span className="rounded border px-2 py-0.5 text-xs">{s||"pending"}</span>; }
export default function Page(){
  const tree = useReturnStore(s=>s.getTree());
  const get = useReturnStore(s=>s.getStatus);
  const rows = [
    { label:"Income — Salary", href:"/flow/income/salary", status:get("income/salary") },
    { label:"Family — Marital", href:"/flow/family/marital-status", status:get("family/marital") },
    { label:"Family — Dependents", href:"/flow/family/dependents", status:get("family/dependents") },
    { label:"Deductions — Housing Owner", href:"/flow/deductions/housing/owner", status:get("deductions/housing/owner") },
    { label:"Deductions — Housing Tenant", href:"/flow/deductions/housing/tenant", status:get("deductions/housing/tenant") }
  ];
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Summary</h2>
      <div className="space-y-2">
        {rows.map(r=>(
          <div key={r.href} className="flex items-center justify-between rounded border p-3">
            <Link href={r.href} className="underline">{r.label}</Link>
            <Status s={r.status} />
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600">Entered = you typed an amount; Uploaded = you provided a document; Pending = needs either.</p>
    </div>
  );
}
