"use client";
import { useParams } from "next/navigation";
import BranchNavControls from "@/components/flow/BranchNavControls";
export default function Page() {
  const p = useParams() as any;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Marital status</h1>
      <p>Placeholder page.</p>
      <BranchNavControls clientId={p.clientId} returnId={p.returnId} nodeKey="marital" />
    </div>
  );
}
