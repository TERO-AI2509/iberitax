"use client"
import useSWR from "swr"
export default function Page({ params }: { params: { returnId: string } }) {
  const { data } = useSWR(`/api/return/${params.returnId}/summary`, (u)=>fetch(u).then(r=>r.json()))
  const t = data?.data?.totals || { income:0, deductions:0, tax:0, withholdings:0, result:0 }
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your Tax Summary</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <Card title="Income total" value={t.income}/>
        <Card title="Deductions total" value={t.deductions}/>
        <Card title="Tax calculated" value={t.tax}/>
        <Card title="Withholdings (already paid)" value={t.withholdings}/>
      </div>
      <Result value={t.result}/>
    </div>
  )
}
function Card({title,value}:{title:string,value:number}){ return <div className="border rounded p-4"><div className="text-sm opacity-70">{title}</div><div className="text-xl font-semibold">€ {value.toFixed(2)}</div></div> }
function Result({value}:{value:number}){ const positive = value>=0; return <div className={`p-5 rounded text-white ${positive?'bg-green-600':'bg-red-600'}`}>{positive?'Refund':'To pay'}: € {Math.abs(value).toFixed(2)}</div> }
