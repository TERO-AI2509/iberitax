"use client"

import * as React from "react"
import DataList, { type DataRow } from "@/components/ui/DataList"

const sample: DataRow[] = [
  { id: "1", title: "Ana García", subtitle: "Client • Madrid", meta: "ID 001" },
  { id: "2", title: "João Silva", subtitle: "Partner • Lisbon", meta: "ID 002" },
  { id: "3", title: "José Pérez", subtitle: "Lead • Valencia", meta: "ID 003" },
  { id: "4", title: "Maria Rossi", subtitle: "Advisor • Milan", meta: "ID 004" },
]

export default function Page() {
  const [selA, setSelA] = React.useState<st[]>(["2"])
  const [selB, setSelB] = React.useState<st[]>([])

  const toggleA = (id: st) =>
    setSelA((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const toggleB = (id: st) =>
    setSelB((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))

  return (
    <div className="p-6 space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-3">Comfy density • multi-select</h2>
        <DataList rows={sample} selectedIds={selA} onToggle={toggleA} density="comfy" />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Compact density • multi-select</h2>
        <DataList rows={sample} selectedIds={selB} onToggle={toggleB} density="compact" />
      </section>

      <p className="text-sm text-foreground/70">
        Focus uses a subtle shadow and border emphasis without any halo . Selection strengthens the border and shows a checkmark. Fully keyboard accessible.
      </p>
    </div>
  )
}
