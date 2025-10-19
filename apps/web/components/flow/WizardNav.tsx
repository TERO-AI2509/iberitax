"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { nextInItem, prevInItem, parentOf } from "./nav-helpers";
export default function WizardNav(){
  const path = usePathname() || "/flow";
  const prev = prevInItem(path);
  const backHref = prev || parentOf(path);
  const nextHref = nextInItem(path) || parentOf(path);
  return (
    <div className="mt-8 flex items-center justify-between">
      <Link href={backHref} className="rounded border px-4 py-2">Back</Link>
      <Link href={nextHref} className="rounded border px-4 py-2">Continue</Link>
    </div>
  );
}
