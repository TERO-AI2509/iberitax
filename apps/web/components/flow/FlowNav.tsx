"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function FlowNav(){
  const path = usePathname() || "/flow";
  const parts = path.split("/").filter(Boolean);
  const isFlow = parts[0] === "flow";
  const showBack = isFlow && parts.length > 1;
  const parent = showBack ? `/${parts.slice(0, parts.length-1).join("/")}` : "/flow";
  return (
    <div className="mb-6 flex items-center gap-3 text-sm">
      {showBack && <Link href={parent} className="rounded border px-3 py-1">Back</Link>}
      <Link href="/flow" className="underline">Overview</Link>
    </div>
  );
}
