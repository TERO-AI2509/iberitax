import React from "react";
import CasillaDeltas from "../../../../../../../components/summary/CasillaDeltas";
type Props = { params: { clientId: string; returnId: string } };
export default function SummaryPage({ params }: Props) {
  const { returnId } = params;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Summary</h1>
      <CasillaDeltas returnId={returnId} />
    </div>
  );
}
