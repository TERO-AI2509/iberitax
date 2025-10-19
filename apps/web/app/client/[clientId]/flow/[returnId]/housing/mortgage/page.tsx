"use client";
import React from "react";
import SimpleAnswerForm from "@/components/answers/SimpleAnswerForm";
import SuggestionsPanel from "@/components/suggestions/SuggestionsPanel";
import BranchNavControls from "@/components/flow/BranchNavControls";
import AutoPersist from "@/components/flow/AutoPersist";
import CasillaChips from "@/components/casillas/CasillaChips";
import { CasillasByKey } from "@/components/casillas/casillas.map";
export default function Page({ params }: { params: { clientId: string; returnId: string } }) {
  const ns = "housing.mortgage";
  const fields = ["bank", "yearInterest", "yearPrincipal"];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Mortgage</h1>
      <AutoPersist returnId={params.returnId} ns={ns} fields={fields} />
      <SimpleAnswerForm
        clientId={params.clientId}
        returnId={params.returnId}
        answerKey={ns}
        fields={[
          { name: "bank", label: "Bank", type: "text" },
          { name: "yearInterest", label: "Interest paid (year)", type: "number" },
          { name: "yearPrincipal", label: "Principal repaid (year)", type: "number" }
        ]}
        meta={{ setFlagsOnSave: { "housing.mortgage.uploaded": true } }}
      />
      <CasillaChips casillas={CasillasByKey[ns] || []} />
      <SuggestionsPanel returnId={params.returnId} areas={["HOUSING", "SUMMARY"]} />
      <BranchNavControls clientId={params.clientId} returnId={params.returnId} nodeKey={ns} />
    </div>
  );
}
