"use client"
import { useState } from "react"
import NotSureCheckbox from "@/components/flow/NotSureCheckbox"
import { saveSectionDelta } from "@/components/flow/persist"
export default function Page({ params }: { params: { clientId: string, returnId: string } }) {
  const [employer,setEmployer]=useState("")
  const [gross,setGross]=useState<number|''>("")
  const [withholdings,setWithholdings]=useState<number|''>("")
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Employment income</h1>
      <div className="space-y-3">
        <input className="border p-2 w-full" placeholder="Employer name" value={employer} onChange={e=>setEmployer(e.target.value)} onBlur={()=>saveSectionDelta(params.returnId,"income",{ salary:{ employer }})}/>
        <input className="border p-2 w-full" placeholder="Gross salary (€)" inputMode="decimal" value={gross} onChange={e=>setGross(e.target.value as any)} onBlur={()=>saveSectionDelta(params.returnId,"income",{ salary:{ gross: Number(gross)||0 }})}/>
        <div className="space-y-2">
          <input className="border p-2 w-full" placeholder="Withholdings (IRPF) (€)" inputMode="decimal" value={withholdings} onChange={e=>setWithholdings(e.target.value as any)} onBlur={()=>saveSectionDelta(params.returnId,"income",{ salary:{ withholdings: Number(withholdings)||0 }})}/>
          <NotSureCheckbox returnId={params.returnId} section="income" jsonPath="/income/salary/withholdings"/>
        </div>
      </div>
    </div>
  )
}
