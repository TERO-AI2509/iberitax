"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadSnapshot, writeSlice } from "@/components/flow/persist"

export default function SalaryPage({ params }: { params: { returnId: string } }) {
  const router = useRouter()
  const [salary, setSalary] = useState<{ salary?: number; irpf?: number; ss?: number }>({})
  useEffect(() => {
    const snap = loadSnapshot(params.returnId)
    setSalary(snap.salary || {})
  }, [params.returnId])

  const setNum = (k: "salary"|"irpf"|"ss", v: string) => {
    const n = v === "" ? undefined : Number(v)
    const next = { ...salary, [k]: Number.isFinite(n as any) ? n : undefined }
    setSalary(next)
    writeSlice(params.returnId, "salary", next, "Entered")
  }
  const onContinue = () => {
    writeSlice(params.returnId, "salary", salary, "Completed")
    router.push(`/flow/${params.returnId}/family/dependents`)
  }
  const onBack = () => router.push(`/flow/${params.returnId}`)

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Salary</h2>
      <Field label="Gross salary" value={salary.salary ?? ""} onChange={(v) => setNum("salary", v)} />
      <Field label="IRPF withheld" value={salary.irpf ?? ""} onChange={(v) => setNum("irpf", v)} />
      <Field label="Social security" value={salary.ss ?? ""} onChange={(v) => setNum("ss", v)} />
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
