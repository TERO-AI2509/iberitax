"use client";
import { useParams } from "next/navigation";
import SimpleAnswerForm from "@/components/answers/SimpleAnswerForm";
import BranchNavControls from "@/components/flow/BranchNavControls";
import AutoPersist from "@/components/flow/AutoPersist";
import CasillaChips from "@/components/casillas/CasillaChips";
import { CasillasByKey } from "@/components/casillas/casillas.map";
export default function Page() {
  const p = useParams() as any;
  const clientId = p.clientId as string;
  const returnId = p.returnId as string;
  const ns = "self-employment.direct";
  const fields = ["revenue", "expenses", "withheld"];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Self-employment (Direct estimation)</h1>
      <AutoPersist returnId={returnId} ns={ns} fields={fields} />
      <SimpleAnswerForm
        returnId={returnId}
        keyPath={ns}
        fields={[
          { name: "revenue", label: "Revenue", type: "number" },
          { name: "expenses", label: "Deductible expenses", type: "number" },
          { name: "withheld", label: "Withholding tax (model 130/131)", type: "number" }
        ]}
      />
      <CasillaChips casillas={CasillasByKey[ns] || []} />
      <BranchNavControls clientId={clientId} returnId={returnId} nodeKey={ns} />
    </div>
  );
}
