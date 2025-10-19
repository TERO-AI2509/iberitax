"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadSnapshot, writeSlice } from "@/components/flow/persist"

export default function DependentsPage({ params }: { params: { returnId: string } }) {
  const router = useRouter()
  const [count, setCount] = useState<number | undefined>(undefined)
  useEffect(() => {
    const snap = loadSnapshot(params.returnId)
    setCount(snap.dependents?.count)
  }, [params.returnId])

  const onChange = (v: string) => {
    const n = v === "" ? undefined : Number(v)
    const next = { count: Number.isFinite(n as any) ? (n as number) : undefined }
    setCount(next.count)
    writeSlice(params.returnId, "dependents", next, "Entered")
  }
  const onBack = () => router.push(`/flow/${params.returnId}/salary`)
  const onContinue = () => {
    writeSlice(params.returnId, "dependents", { count }, "Completed")
    router.push(`/flow/${params.returnId}/deductions/housing/owner`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Dependents</h2>
      <label className="block space-y-1">
        <span className="text-sm">Number of dependents</span>
        <input className="w-full rounded-xl border p-3" value={count ?? ""} onChange={(e) => onChange(e.target.value)} />
      </label>
      <Nav onBack={onBack} onContinue={onContinue} />
    </div>
  )
}
function Nav({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return (
    <div className="flex justify-between pt-4">
      <button className="rounded-xl border px-4 py-2" onClick={onBack}>Back</button>
      <button className="rounded-xl border px-4 py-2" onClick={onContinue}>Continue</button>
    </div>
  )
}
