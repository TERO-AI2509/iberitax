"use client"
import { useParams } from "next/navigation"
import SimpleAnswerForm from "@/components/answers/SimpleAnswerForm"
import SuggestionsPanel from "@/components/suggestions/SuggestionsPanel"
import BranchNavControls from "@/components/flow/BranchNavControls"
export default function Page(){
  const p=useParams() as any
  const clientId=p.clientId as string
  const returnId=p.returnId as string
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Elderly or other dependents</h1>
      <SimpleAnswerForm returnId={returnId} keyPath="family.dependents" fields={[{name:"count",label:"Number of dependents",type:"number"}]} />
      <SuggestionsPanel returnId={returnId} section="family"/>
      <BranchNavControls clientId={clientId} returnId={returnId}/>
    </div>
  )
}
