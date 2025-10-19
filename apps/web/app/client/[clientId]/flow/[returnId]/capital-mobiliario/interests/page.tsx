"use client";
import { useParams } from "next/navigation";
import BranchNavControls from "@/components/flow/BranchNavControls";
import CasillaChips from "@/components/casillas/CasillaChips";
import { CasillasByKey } from "@/components/casillas/casillas.map";
export default function Page() {
  const p = useParams() as any;
  const clientId = p.clientId as string;
  const returnId = p.returnId as string;
  const ns = location.pathname.split("/client/")[1]?.split("/flow/")[1]?.split("/").slice(2).join(".") || "";
  const k = ns.replace(/\//g, ".");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Placeholder</h1>
      <CasillaChips casillas={CasillasByKey[k] || []} />
      <BranchNavControls clientId={clientId} returnId={returnId} nodeKey={k} />
    </div>
  );
}
