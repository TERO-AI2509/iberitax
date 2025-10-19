"use client"
import { useSearchParams,useRouter } from "next/navigation"
import { useEffect,useState } from "react"

function looksInvalid(v:string|null){return !v || v.includes("<") || v.includes("%3C")}

export default function Page(){
  const q=useSearchParams()
  const r=useRouter()
  const rawClientId=q.get("clientId")
  const rawReturnId=q.get("returnId")
  const [clientId,setClientId]=useState<string>(rawClientId||"")
  const [returnId,setReturnId]=useState<string>(rawReturnId||"")
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    if(looksInvalid(rawClientId) || looksInvalid(rawReturnId)){
      const a=crypto.randomUUID()
      const b=crypto.randomUUID()
      setClientId(a)
      setReturnId(b)
      const u=new URL(window.location.href)
      u.searchParams.set("clientId",a)
      u.searchParams.set("returnId",b)
      window.history.replaceState(null,"",u.toString())
    }
  },[rawClientId,rawReturnId])

  async function markPaidAndGo(){
    setBusy(true)
    await fetch(`/api/dev/mark-paid?returnId=${encodeURIComponent(returnId)}`,{method:"POST"})
    document.cookie=`paid_all=1; Path=/; Max-Age=${7*24*3600}`
    document.cookie=`paid_return_${returnId}=1; Path=/; Max-Age=${7*24*3600}`
    setBusy(false)
    r.replace(`/client/${clientId}/flow/${returnId}/overview`)
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Payment</h1>
      <p className="opacity-80 text-sm">Client {clientId} · Return {returnId}</p>
      <div className="flex gap-3">
        <button onClick={markPaidAndGo} disabled={busy||!clientId||!returnId} className="px-4 py-2 rounded bg-emerald-600 text-white">
          {busy?"Processing...":"Pay now and continue"}
        </button>
        <button onClick={markPaidAndGo} disabled={busy||!clientId||!returnId} className="px-4 py-2 rounded bg-gray-200">
          {busy?"…":"Dev: mark paid and continue"}
        </button>
      </div>
    </div>
  )
}
