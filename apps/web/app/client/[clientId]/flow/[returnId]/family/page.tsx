"use client"
import { useParams } from "next/navigation"
import SuggestionsPanel from "@/components/suggestions/SuggestionsPanel"
import BranchNavControls from "@/components/flow/BranchNavControls"
export default function Page(){
  const p=useParams() as any
  const clientId=p.clientId as string
  const returnId=p.returnId as string
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Family</h1>
      <p className="opacity-70 text-sm">Open “Children” in the sidebar to enter details.</p>
      <SuggestionsPanel returnId={returnId} section="family"/>
      <BranchNavControls clientId={clientId} returnId={returnId}/>
    </div>
  )
}
