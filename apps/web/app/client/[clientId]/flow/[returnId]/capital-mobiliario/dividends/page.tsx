"use client";
import { useParams } from "next/navigation";
import SimpleAnswerForm from "@/components/answers/SimpleAnswerForm";
import SuggestionsPanel from "@/components/suggestions/SuggestionsPanel";
import BranchNavControls from "@/components/flow/BranchNavControls";
import AutoPersist from "@/components/flow/AutoPersist";
import CasillaChips from "@/components/casillas/CasillaChips";
import { CasillasByKey } from "@/components/casillas/casillas.map";
export default function Page() {
  const p = useParams() as any;
  const clientId = p.clientId as string;
  const returnId = p.returnId as string;
  const ns = "capital-mobiliario.dividends";
  const fields = ["payer", "gross", "withheld"];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dividends</h1>
      <AutoPersist returnId={returnId} ns={ns} fields={fields} />
      <SimpleAnswerForm
        returnId={returnId}
        keyPath={ns}
        fields={[
          { name: "payer", label: "Payer", type: "text" },
          { name: "gross", label: "Gross dividends", type: "number" },
          { name: "withheld", label: "Withholding tax", type: "number" }
        ]}
      />
      <CasillaChips casillas={CasillasByKey[ns] || []} />
      <SuggestionsPanel returnId={returnId} section="dividends" />
      <BranchNavControls clientId={clientId} returnId={returnId} nodeKey={ns} />
    </div>
  );
}
