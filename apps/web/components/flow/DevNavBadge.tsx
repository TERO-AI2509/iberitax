"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FLOW_STEPS } from "./steps";
import { parentOf, childrenOf } from "./nav-helpers";
export default function DevNavBadge(){
  if (process.env.NODE_ENV === "production") return null as any;
  const path = usePathname() || "/flow";
  const parent = parentOf(path);
  const siblings = childrenOf(parent);
  const idx = siblings.indexOf(path);
  const prev = idx > 0 ? siblings[idx-1] : "";
  const next = idx >= 0 && idx < siblings.length-1 ? siblings[idx+1] : "";
  const g = FLOW_STEPS.indexOf(path);
  const gPrev = g > 0 ? FLOW_STEPS[g-1] : "";
  const gNext = g >= 0 && g < FLOW_STEPS.length-1 ? FLOW_STEPS[g+1] : "";
  return (
    <div className="fixed bottom-4 right-4 rounded-lg border bg-white/90 px-3 py-2 text-xs shadow">
      <div className="flex gap-2">
        <span>Here:</span>
        <span className="font-mono">{path}</span>
      </div>
      <div className="flex gap-2">
        <span>Parent:</span>
        <Link href={parent} className="underline">{parent}</Link>
      </div>
      <div className="flex gap-2">
        <span>Prev:</span>
        {prev ? <Link href={prev} className="underline">{prev}</Link> : <span className="opacity-60">None</span>}
      </div>
      <div className="flex gap-2">
        <span>Next:</span>
        {next ? <Link href={next} className="underline">{next}</Link> : <span className="opacity-60">None</span>}
      </div>
      <div className="mt-1 text-[10px] opacity-60">
        Global: {gPrev||"None"} → {path} → {gNext||"None"}
      </div>
    </div>
  );
}
