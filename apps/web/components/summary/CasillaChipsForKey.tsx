"use client"
import { useEffect,useState } from "react"
export default function CasillaChipsForKey({qkey}:{qkey:string}){
  const [nums,setNums]=useState<number[]>([])
  useEffect(()=>{
    let alive=true
    fetch(`/api/mapping?key=${encodeURIComponent(qkey)}`)
      .then(async r=>{ if(!r.ok) return {casillas:[]} ; return r.json() })
      .then(j=>{ if(alive) setNums(j.casillas||[]) })
      .catch(()=>{ if(alive) setNums([]) })
    return ()=>{ alive=false }
  },[qkey])
  if(!nums.length) return null
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {nums.map(n=><span key={n} className="px-2 py-1 rounded-full border">#{n}</span>)}
    </div>
  )
}
