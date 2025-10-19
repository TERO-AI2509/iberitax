"use client"
import { useParams } from "next/navigation"
import BranchNavControls from "@/components/flow/BranchNavControls"
export default function Page(){
  const p=useParams() as any
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Capital income (financial)</h1>
      <p className="opacity-70 text-sm">Open Interests or Dividends in the sidebar.</p>
      <BranchNavControls clientId={p.clientId as string} returnId={p.returnId as string}/>
    </div>
  )
}
