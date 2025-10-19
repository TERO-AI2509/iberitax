"use client"
import { useParams } from "next/navigation"
import SimpleAnswerForm from "@/components/answers/SimpleAnswerForm"
import BranchNavControls from "@/components/flow/BranchNavControls"
export default function Page(){
  const p=useParams() as any
  const clientId=p.clientId as string
  const returnId=p.returnId as string
  return(<div className="space-y-6"><h1 className="text-2xl font-semibold">Securities & funds</h1><SimpleAnswerForm returnId={returnId} keyPath="income.gains.securities" fields={[{name:"profit",label:"Net gain/loss",type:"number"}]} /><BranchNavControls clientId={clientId} returnId={returnId}/></div>)}
