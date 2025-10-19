"use client";
import React, { useEffect, useState } from "react";
import CasillaDeltas from "@/components/summary/CasillaDeltas";
import SuggestionsPanel from "@/components/suggestions/SuggestionsPanel";

export default function Page({ params }: { params: { clientId: string; returnId: string } }) {
  const [stamp, setStamp] = useState(0);
  useEffect(() => {
    const sub = window.addEventListener("answers:saved", () => setStamp(s => s + 1));
    return () => window.removeEventListener("answers:saved", () => {});
  }, []);
  return (
    <div className="space-y-6">
      <CasillaDeltas key={stamp} returnId={params.returnId} />
      <SuggestionsPanel returnId={params.returnId} areas={["SUMMARY"]} />
    </div>
  );
}
