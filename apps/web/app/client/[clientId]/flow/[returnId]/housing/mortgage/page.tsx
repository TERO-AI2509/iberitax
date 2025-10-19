"use client";
import React from "react";
import SimpleAnswerForm from "@/components/answers/SimpleAnswerForm";
import SuggestionsPanel from "@/components/suggestions/SuggestionsPanel";
import BranchNavControls from "@/components/flow/BranchNavControls";
import CasillaChipsForKey from "@/components/casillas/CasillaChipsForKey";

export default function Page({ params }: { params: { clientId: string; returnId: string } }) {
  const key = "housing.mortgage";
  const fields = [
    { name: "bank", label: "Bank", type: "text" },
    { name: "yearInterest", label: "Interest paid (year)", type: "number" },
    { name: "yearPrincipal", label: "Principal repaid (year)", type: "number" },
    { name: "upload", label: "Upload mortgage docs (placeholder)", type: "file" }
  ];
  const meta = { setFlagsOnSave: { "housing.mortgage.uploaded": true } };
  return (
    <div className="space-y-6">
      <SimpleAnswerForm clientId={params.clientId} returnId={params.returnId} answerKey={key} fields={fields} meta={meta} />
      <CasillaChipsForKey prefix={key} />
      <SuggestionsPanel returnId={params.returnId} areas={["HOUSING","SUMMARY"]} />
      <BranchNavControls clientId={params.clientId} returnId={params.returnId} nodeKey={key} />
    </div>
  );
}
