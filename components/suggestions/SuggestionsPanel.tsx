"use client";
import React from "react";
type Suggestion = { id: string; title: string; description?: string; badge?: string };
export default function SuggestionsPanel({ returnId }: { returnId: string }) {
  const [items, setItems] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [applying, setApplying] = React.useState<string | null>(null);
  React.useEffect(() => {
    let mounted = true;
    fetch(`/api/return/${encodeURIComponent(returnId)}/suggestions`, { cache: "no-store" })
      .then(r => r.json())
      .then((data) => { if (!mounted) return; setItems(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
    return () => { mounted = false; };
  }, [returnId]);
  async function applySuggestion(id: string) {
    setApplying(id);
    try {
      await fetch(`/api/return/${encodeURIComponent(returnId)}/suggestions/apply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id })
      });
    } finally {
      setApplying(null);
    }
  }
  if (loading) return <div className="rounded-2xl border p-4">Loading suggestions…</div>;
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 text-lg font-semibold">Suggestions</div>
      <ul className="space-y-3">
        {items.map(s => (
          <li key={s.id} className="rounded-xl border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">{s.title}</div>
                {s.description ? <div className="text-sm text-gray-600">{s.description}</div> : null}
                {s.badge ? <span className="mt-1 inline-block rounded-full border px-2 py-0.5 text-xs">{s.badge}</span> : null}
              </div>
              <button type="button" onClick={() => applySuggestion(s.id)} disabled={applying === s.id} className="rounded-xl border px-3 py-1.5 text-sm disabled:opacity-50">
                {applying === s.id ? "Applying…" : "Apply"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
