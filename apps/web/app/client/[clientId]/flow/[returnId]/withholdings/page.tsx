"use client"
import { useParams } from "next/navigation"
import SimpleAnswerForm from "@/components/answers/SimpleAnswerForm"
import BranchNavControls from "@/components/flow/BranchNavControls"
export default function Page(){
  const p=useParams() as any
  const clientId=p.clientId as string
  const returnId=p.returnId as string
  return(<div className="space-y-6"><h1 className="text-2xl font-semibold">Withholdings & advance payments</h1><SimpleAnswerForm returnId={returnId} keyPath="withholding" fields={[{name:"salary",label:"Salary withholdings",type:"number"},{name:"capital",label:"Capital withholdings",type:"number"}]} /><BranchNavControls clientId={clientId} returnId={returnId}/></div>)}
