"use client"
import useSWR from "swr"
export default function Page({ params }: { params: { returnId: string, clientId: string } }) {
  const { data, mutate } = useSWR(`/api/return/${params.returnId}/summary`, (u)=>fetch(u).then(r=>r.json()))
  const open = data?.data?.openUnsureCount || 0
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Review & Confirm</h1>
      <div className="border rounded p-4">{open>0?`⚠ ${open} item(s) marked 'unsure'`:'✅ No unsure items'}</div>
      <button className="px-4 py-2 rounded bg-black text-white" onClick={async()=>{
        const body = open>0 ? { acknowledgeUnsure: true } : {}
        const r = await fetch(`/api/flow/${params.clientId}/${params.returnId}/submit`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) })
        if(r.ok){ await mutate() }
      }}>File my return</button>
    </div>
  )
}
