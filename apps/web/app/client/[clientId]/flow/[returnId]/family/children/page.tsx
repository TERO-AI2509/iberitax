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
      <h1 className="text-2xl font-semibold">Children</h1>
      <SimpleAnswerForm
        returnId={returnId}
        keyPath="family.children"
        fields={[
          {name:"numChildren",label:"Number of children",type:"number"},
          {name:"children[0].dob",label:"Child 1 — Date of birth (YYYY-MM-DD)",type:"text"},
          {name:"children[0].disabilityPct",label:"Child 1 — Disability %",type:"number"},
          {name:"children[1].dob",label:"Child 2 — Date of birth",type:"text"},
          {name:"children[1].disabilityPct",label:"Child 2 — Disability %",type:"number"},
        ]}
      />
      <SuggestionsPanel returnId={returnId} section="family"/>
      <BranchNavControls clientId={clientId} returnId={returnId}/>
    </div>
  )
}
