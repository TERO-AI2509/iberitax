"use client"
import { useParams } from "next/navigation"
import BranchNavControls from "@/components/flow/BranchNavControls"
export default function Page(){
  const p=useParams() as any
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Deductions — State & Regional</h1>
      <p className="opacity-70 text-sm">Open General deductions or Regional deductions in the sidebar.</p>
      <BranchNavControls clientId={p.clientId as string} returnId={p.returnId as string}/>
    </div>
  )
}
