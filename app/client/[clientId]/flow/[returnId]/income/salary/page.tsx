import React from "react";
import SimpleAnswerForm from "../../../../../../../components/answers/SimpleAnswerForm";
import BranchNavControls from "../../../../../../../components/flow/BranchNavControls";
import SuggestionsPanel from "../../../../../../../components/suggestions/SuggestionsPanel";
type Props = { params: { clientId: string; returnId: string } };
export default function SalaryPage({ params }: Props) {
  const { returnId } = params;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Salary</h1>
      <SimpleAnswerForm
        returnId={returnId}
        sectionKey="salary"
        fields={[
          { name: "employer", label: "Employer" },
          { name: "grossAnnual", label: "Gross annual salary", type: "number" },
          { name: "withheld", label: "Tax withheld", type: "number" },
          { name: "hasNomina", label: "Nomina uploaded", type: "checkbox" }
        ]}
      />
      <SuggestionsPanel returnId={returnId} />
      <BranchNavControls returnId={returnId} />
    </div>
  );
}
