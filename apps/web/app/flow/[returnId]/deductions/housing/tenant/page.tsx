"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { loadSnapshot, writeSlice } from "@/components/flow/persist"

export default function TenantHousingPage({ params }: { params: { returnId: string } }) {
  const router = useRouter()
  const [annualRent, setAnnualRent] = useState<number | undefined>(undefined)
  useEffect(() => {
    const snap = loadSnapshot(params.returnId)
    setAnnualRent(snap.tenantHousing?.annualRent)
  }, [params.returnId])

  const onChange = (v: string) => {
    const n = v === "" ? undefined : Number(v)
    const next = { annualRent: Number.isFinite(n as any) ? (n as number) : undefined }
    setAnnualRent(next.annualRent)
    writeSlice(params.returnId, "tenantHousing", next, "Entered")
  }
  const onBack = () => router.push(`/flow/${params.returnId}/deductions/housing/owner`)
  const onContinue = () => {
    writeSlice(params.returnId, "tenantHousing", { annualRent }, "Completed")
    router.push(`/flow/${params.returnId}/documents`)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Housing — Tenant</h2>
      <label className="block space-y-1">
        <span className="text-sm">Annual rent</span>
        <input className="w-full rounded-xl border p-3" value={annualRent ?? ""} onChange={(e) => onChange(e.target.value)} />
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
