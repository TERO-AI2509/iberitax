"use client"
import { useParams } from "next/navigation"
import SimpleAnswerForm from "@/components/answers/SimpleAnswerForm"
import SuggestionsPanel from "@/components/suggestions/SuggestionsPanel"
import BranchNavControls from "@/components/flow/BranchNavControls"
import CasillaChipsForKey from "@/components/summary/CasillaChipsForKey"
export default function Page(){
  const p=useParams() as any
  const clientId=p.clientId as string
  const returnId=p.returnId as string
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Salary</h1>
      <CasillaChipsForKey qkey="income.salary"/>
      <SimpleAnswerForm
        returnId={returnId}
        keyPath="income.salary"
        fields={[
          {name:"gross",label:"Gross salary",type:"number"},
          {name:"withheld",label:"Tax withheld",type:"number"},
          {name:"perks.companyCar.value",label:"Company car (annual value in kind)",type:"number"},
          {name:"perks.companyCar.zeroEmission",label:"Company car is zero-emission?",type:"checkbox"}
        ]}
      />
      <SuggestionsPanel returnId={returnId} section="salary"/>
      <BranchNavControls clientId={clientId} returnId={returnId}/>
    </div>
  )
}
