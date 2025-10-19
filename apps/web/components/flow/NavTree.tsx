"use client";
import Link from "next/link";
import { loadSnapshot } from "@/components/flow/persist";
type Item={label:string; href:string};
const items:Item[]=[
  {label:"Salary",href:"/salary"},
  {label:"Dependents",href:"/family/dependents"},
  {label:"Housing Owner",href:"/deductions/housing/owner"},
  {label:"Housing Tenant",href:"/deductions/housing/tenant"},
  {label:"Documents",href:"/documents"},
];
export default function NavTree({returnId}:{returnId:string}){
  const base=(p:string)=>`/flow/${returnId}${p}`;
  const snap=loadSnapshot(returnId);
  const getStatus=(key:string)=>snap.statuses?.[key]||"Pending";
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map(it=>(
        <Link key={it.href} href={base(it.href)} className="block rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <span>{it.label}</span>
            <span className="text-xs opacity-70">{getStatus(labelToKey(it.label))}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
function labelToKey(label:string){
  switch(label){
    case "Salary": return "salary";
    case "Dependents": return "dependents";
    case "Housing Owner": return "ownerHousing";
    case "Housing Tenant": return "tenantHousing";
    case "Documents": return "documents";
    default: return label.toLowerCase();
  }
}
