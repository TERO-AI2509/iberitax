"use client";
import Link from "next/link";
type Props={ returnId:string };
export default function ReturnNav({returnId}:Props){
  const base=(p:string)=>`/flow/${returnId}${p}`;
  return (
    <nav aria-label="Sections" className="flow-nav">
      <ul className="flex flex-wrap gap-3">
        <li><Link href={base("/salary")}>Salary</Link></li>
        <li><Link href={base("/family/dependents")}>Family › Dependents</Link></li>
        <li><Link href={base("/deductions/housing/owner")}>Deductions › Housing › Owner</Link></li>
        <li><Link href={base("/deductions/housing/tenant")}>Deductions › Housing › Tenant</Link></li>
        <li><Link href={base("/documents")}>Documents</Link></li>
      </ul>
    </nav>
  );
}
