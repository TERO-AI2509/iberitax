"use client";
import React, { useEffect, useState } from "react";

type Suggestion = {
  id: string;
  area: string;
  title: string;
  rationale: string;
  casillas: number[];
  applied?: boolean;
  applyPayload?: Record<string, any>;
};

export default function SuggestionsPanel({ returnId, areas }: { returnId: string; areas?: string[] }) {
  const [sugs, setSugs] = useState<Suggestion[]>([]);
  async function load() {
    const r = await fetch(`/api/return/${returnId}/suggestions`, { cache: "no-store" });
    if (!r.ok) return;
    const j = await r.json();
    let list: Suggestion[] = j?.suggestions || [];
    if (areas?.length) list = list.filter(x => areas.includes(x.area));
    setSugs(list);
  }
  async function applyOne(s: Suggestion) {
    await fetch(`/api/return/${returnId}/suggestions/apply`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ suggestionId: s.id, payload: s.applyPayload || {} }) });
    await load();
  }
  useEffect(() => { load(); }, [returnId]);
  if (!sugs.length) return null;
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Suggestions</h3>
      {sugs.map(s => (
        <div key={s.id} className="border rounded-xl p-3 flex items-start justify-between">
          <div>
            <div className="font-medium">{s.title}</div>
            <div className="text-sm opacity-80">{s.rationale}</div>
            {!!s.casillas?.length && (
              <div className="mt-2 flex gap-1 flex-wrap">
                {s.casillas.map(c => <span key={c} className="px-2 py-1 text-xs rounded-full border">#{c}</span>)}
              </div>
            )}
          </div>
          <button className="btn" disabled={s.applied} onClick={() => applyOne(s)}>{s.applied ? "Applied" : "Apply"}</button>
        </div>
      ))}
    </div>
  );
}
