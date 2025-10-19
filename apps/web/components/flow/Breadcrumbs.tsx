"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function Breadcrumbs({returnId}:{returnId:string}){
  const path=usePathname()||"";
  const after=path.split(`/flow/${returnId}`)[1]||"";
  const parts=after.split("/").filter(Boolean);
  const segs=parts.map((p,i)=>({name:p, href:`/flow/${returnId}/`+parts.slice(0,i+1).join("/")}));
  return (
    <nav aria-label="Breadcrumb" className="flow-bc my-3">
      <ol className="flex flex-wrap gap-2 items-center">
        <li><Link href={`/flow/${returnId}`}>Home</Link></li>
        {segs.map(s=>(<li key={s.href} className="flex items-center gap-2">› <Link href={s.href}>{decodeURIComponent(s.name)}</Link></li>))}
      </ol>
    </nav>
  );
}
