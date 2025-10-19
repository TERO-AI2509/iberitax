"use client"
import { useParams } from "next/navigation"
import SimpleAnswerForm from "@/components/answers/SimpleAnswerForm"
import BranchNavControls from "@/components/flow/BranchNavControls"
import CasillaChipsForKey from "@/components/summary/CasillaChipsForKey"
export default function Page(){
  const p=useParams() as any
  const clientId=p.clientId as string
  const returnId=p.returnId as string
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Regional deductions</h1>
      <CasillaChipsForKey qkey="deductions.regional.rent.young"/>
      <SimpleAnswerForm
        returnId={returnId}
        keyPath="deductions.regional"
        fields={[
          {name:"region",label:"Autonomous community (e.g., Madrid)",type:"text"},
          {name:"rent.young.age",label:"Your age",type:"number"},
          {name:"rent.young.annualRent",label:"Annual rent paid",type:"number"}
        ]}
      />
      <BranchNavControls clientId={clientId} returnId={returnId}/>
    </div>
  )
}
