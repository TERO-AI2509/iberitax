"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadSnapshot, writeSlice } from "@/components/flow/persist"

export default function OwnerHousingPage({ params }: { params: { returnId: string } }) {
  const router = useRouter()
  const [state, setState] = useState<{ mortgageInterest?: number; ibi?: number; insurance?: number }>({})
  useEffect(() => {
    const snap = loadSnapshot(params.returnId)
    setState(snap.ownerHousing || {})
  }, [params.returnId])

  const setNum = (k: "mortgageInterest"|"ibi"|"insurance", v: string) => {
    const n = v === "" ? undefined : Number(v)
    const next = { ...state, [k]: Number.isFinite(n as any) ? n : undefined }
    setState(next)
    writeSlice(params.returnId, "ownerHousing", next, "Entered")
  }
  const onBack = () => router.push(`/flow/${params.returnId}/family/dependents`)
  const onContinue = () => {
    writeSlice(params.returnId, "ownerHousing", state, "Completed")
    router.push(`/flow/${params.returnId}/deductions/housing/tenant`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Housing — Owner</h2>
      <Field label="Mortgage interest" value={state.mortgageInterest ?? ""} onChange={(v) => setNum("mortgageInterest", v)} />
      <Field label="IBI" value={state.ibi ?? ""} onChange={(v) => setNum("ibi", v)} />
      <Field label="Insurance" value={state.insurance ?? ""} onChange={(v) => setNum("insurance", v)} />
      <Nav onBack={onBack} onContinue={onContinue} />
    </div>
  )
}
function Field({ label, value, onChange }: { label: string; value: number | string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm">{label}</span>
      <input className="w-full rounded-xl border p-3" value={value as any} onChange={(e) => onChange(e.target.value)} />
    </label>
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
