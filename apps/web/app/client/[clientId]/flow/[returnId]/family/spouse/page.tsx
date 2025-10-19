"use client";
import { useParams } from "next/navigation";
import BranchNavControls from "@/components/flow/BranchNavControls";
export default function Page() {
  const p = useParams() as any;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Spouse / partner</h1>
      <p>Placeholder: choose joint or separate filing here.</p>
      <BranchNavControls clientId={p.clientId} returnId={p.returnId} nodeKey="spouse" />
    </div>
  );
}
