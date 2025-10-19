"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { loadSnapshot, summaryCounts } from "@/components/flow/persist"

export default function Overview({ params }: { params: { returnId: string } }) {
  const [counts, setCounts] = useState({ Completed: 0, Entered: 0, Uploaded: 0, Pending: 0 })
  useEffect(() => {
    const snap = loadSnapshot(params.returnId)
    setCounts(summaryCounts(snap.statuses))
  }, [params.returnId])
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Questionnaire Overview</h1>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="Completed" value={counts.Completed} />
        <Stat label="Entered" value={counts.Entered} />
        <Stat label="Uploaded" value={counts.Uploaded} />
        <Stat label="Pending" value={counts.Pending} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Tile href={`/flow/${params.returnId}/salary`} label="Salary" />
        <Tile href={`/flow/${params.returnId}/family/dependents`} label="Dependents" />
        <Tile href={`/flow/${params.returnId}/deductions/housing/owner`} label="Housing Owner" />
        <Tile href={`/flow/${params.returnId}/deductions/housing/tenant`} label="Housing Tenant" />
        <Tile href={`/flow/${params.returnId}/documents`} label="Documents" />
      </div>
    </div>
  )
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}
function Tile({ href, label }: { href: string; label: string }) {
  return (
    <Link className="rounded-2xl border p-6 hover:bg-gray-50" href={href}>
      {label}
    </Link>
  )
}
