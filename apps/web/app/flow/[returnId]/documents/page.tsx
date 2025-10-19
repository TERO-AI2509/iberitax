"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { loadSnapshot, clearSlice } from "@/components/flow/persist"

const Badge = ({ s }: { s?: string }) => {
  const cls = s === "Completed" ? "bg-green-100 text-green-700" : s === "Entered" ? "bg-yellow-100 text-yellow-700" : s === "Uploaded" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
  return <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{s || "Pending"}</span>
}

export default function Documents({ params }: { params: { returnId: string } }) {
  const [statuses, setStatuses] = useState<Record<string, any>>({})
  useEffect(() => {
    setStatuses(loadSnapshot(params.returnId).statuses || {})
  }, [params.returnId])

  const removeSlice = (key: string) => {
    const snap = loadSnapshot(params.returnId)
    const hasData =
      (key === "salary" && snap.salary && Object.keys(snap.salary).length > 0) ||
      (key === "ownerHousing" && snap.ownerHousing && Object.keys(snap.ownerHousing).length > 0) ||
      (key === "tenantHousing" && snap.tenantHousing && Object.keys(snap.tenantHousing).length > 0) ||
      (key === "dependents" && snap.dependents && Object.keys(snap.dependents).length > 0)
    if (!hasData) return
    const ok = window.confirm("Remove entered data for this item?")
    if (ok) {
      clearSlice(params.returnId, key as any)
      setStatuses(loadSnapshot(params.returnId).statuses || {})
    }
  }

  const R = params.returnId
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Documents</h2>
      <div className="space-y-3">
        <Row href={`/flow/${R}/salary`} label="Salary details" statusKey="salary" status={statuses["salary"]} onRemove={removeSlice} />
        <Row href={`/flow/${R}/family/dependents`} label="Dependents details" statusKey="dependents" status={statuses["dependents"]} onRemove={removeSlice} />
        <Row href={`/flow/${R}/deductions/housing/owner`} label="Housing (owner)" statusKey="ownerHousing" status={statuses["ownerHousing"]} onRemove={removeSlice} />
        <Row href={`/flow/${R}/deductions/housing/tenant`} label="Housing (tenant)" statusKey="tenantHousing" status={statuses["tenantHousing"]} onRemove={removeSlice} />
      </div>
      <div className="pt-4 text-sm text-gray-500">Click a row to deep-link. Use Remove to clear that slice.</div>
    </div>
  )

  function Row({ href, label, status, statusKey, onRemove }: { href: string; label: string; statusKey: string; status?: any; onRemove: (k: string) => void }) {
    return (
      <div className="flex items-center justify-between rounded-2xl border p-3">
        <Link href={href} className="flex-1 hover:underline">{label}</Link>
        <Badge s={status} />
        <button className="ml-3 rounded-xl border px-3 py-1" onClick={() => onRemove(statusKey)}>Remove</button>
      </div>
    )
  }
}
