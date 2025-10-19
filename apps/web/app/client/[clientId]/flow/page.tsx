import { redirect } from "next/navigation"
import crypto from "crypto"
export default function Page({params}:{params:{clientId:string}}){
  const returnId=crypto.randomUUID()
  redirect(`/client/${params.clientId}/flow/${returnId}/overview`)
}
