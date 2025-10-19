"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FLOW_STEPS } from "@/components/flow/steps";
function parentOf(path:string){
  const parts = path.split("/").filter(Boolean);
  if(parts.length <= 1) return "/flow";
  return `/${parts.slice(0, parts.length-1).join("/")}`;
}
export default function Page(){
  const here = usePathname() || "";
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Flow Routes (Dev)</h2>
      <div className="rounded border divide-y">
        {FLOW_STEPS.map((p, i)=>{
          const prev = i>0 ? FLOW_STEPS[i-1] : "";
          const next = i<FLOW_STEPS.length-1 ? FLOW_STEPS[i+1] : "";
          const parent = parentOf(p);
          return (
            <div key={p} className="p-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <div>
                <div className="text-xs uppercase opacity-60">Route</div>
                <Link href={p} className={`underline ${here===p?"font-semibold":""}`}>{p}</Link>
              </div>
              <div>
                <div className="text-xs uppercase opacity-60">Parent</div>
                <Link href={parent} className="underline">{parent}</Link>
              </div>
              <div>
                <div className="text-xs uppercase opacity-60">Prev</div>
                {prev ? <Link href={prev} className="underline">{prev}</Link> : <span className="opacity-50">None</span>}
              </div>
              <div>
                <div className="text-xs uppercase opacity-60">Next</div>
                {next ? <Link href={next} className="underline">{next}</Link> : <span className="opacity-50">None</span>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500">Open this any time at /flow/dev/routes</p>
    </div>
  );
}
