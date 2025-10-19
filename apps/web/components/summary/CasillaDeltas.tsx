"use client"
import { useEffect,useState } from "react"
export default function CasillaDeltas({returnId}:{returnId:string}){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{fetch(`/api/return/${returnId}/casillas/deltas`).then(r=>r.json()).then(j=>setItems(j.items||[]))},[returnId])
  if(!items.length) return <div className="text-sm opacity-70">No casilla changes yet</div>
  return (
    <div className="border rounded p-3 space-y-2">
      <div className="font-semibold mb-1">Casillas afectadas</div>
      <div className="flex flex-wrap gap-2">
        {items.map((x:any)=>(<span key={x.casilla} className="px-2 py-1 rounded-full border text-sm">#{x.casilla}: {x.delta}</span>))}
      </div>
    </div>
  )
}
