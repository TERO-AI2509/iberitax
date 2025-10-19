"use client";
import { loadSnapshot, summaryCounts } from "@/components/flow/persist";
export default function NavBadge({returnId}:{returnId:string}){
  const snap = loadSnapshot(returnId);
  const counts = summaryCounts(snap.statuses);
  const total = (counts.Completed||0)+(counts.Entered||0)+(counts.Uploaded||0)+(counts.Pending||0);
  return (
    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs border">
      {counts.Completed||0}✓ · {counts.Entered||0}↳ · {counts.Uploaded||0}⤴ · {counts.Pending||0}/{total}
    </span>
  );
}
