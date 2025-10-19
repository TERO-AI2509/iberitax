import { NextResponse } from "next/server"
import { apiGetEngagementStatus } from "@/lib/api"
import { cookies } from "next/headers"

export async function GET(req:Request){
  const {searchParams}=new URL(req.url)
  const id=searchParams.get("returnId")||""
  if(process.env.NEXT_PUBLIC_BYPASS_PAYMENT==="1"){
    return NextResponse.json({paid:true})
  }
  const c=cookies()
  const paidAll=c.get("paid_all")?.value==="1"
  const paidThis=id? (c.get(`paid_return_${id}`)?.value==="1") : false
  if(paidAll||paidThis){ return NextResponse.json({paid:true}) }
  const data=await apiGetEngagementStatus(id)
  return NextResponse.json(data)
}
