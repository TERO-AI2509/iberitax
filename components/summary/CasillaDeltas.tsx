"use client";
import React from "react";
type Delta = { casilla: string | number; before: number; after: number };
export default function CasillaDeltas({ returnId }: { returnId: string }) {
  const [deltas, setDeltas] = React.useState<Delta[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    let mounted = true;
    fetch(`/api/return/${encodeURIComponent(returnId)}/casillas/deltas`, { cache: "no-store" })
      .then(r => r.json())
      .then((data) => { if (!mounted) return; setDeltas(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
    return () => { mounted = false; };
  }, [returnId]);
  if (loading) return <div className="rounded-2xl border p-4">Loading casilla changes…</div>;
  if (!deltas.length) return <div className="rounded-2xl border p-4">No changes yet.</div>;
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 text-lg font-semibold">Casilla changes</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="py-2">Casilla</th>
            <th className="py-2">Before</th>
            <th className="py-2">After</th>
            <th className="py-2">Δ</th>
          </tr>
        </thead>
        <tbody>
          {deltas.map((d, i) => {
            const diff = (Number.isFinite(d.after) ? d.after : 0) - (Number.isFinite(d.before) ? d.before : 0);
            return (
              <tr key={i} className="border-t">
                <td className="py-2">{String(d.casilla)}</td>
                <td className="py-2">{d.before ?? 0}</td>
                <td className="py-2">{d.after ?? 0}</td>
                <td className="py-2">{diff}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
