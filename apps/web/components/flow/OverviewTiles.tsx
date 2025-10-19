"use client"
import Link from "next/link"
import { useEffect,useState } from "react"
type Node={path:string;label:string;children?:Node[]}

function normalizeNode(raw:any):Node{
  const path = raw?.path || "/"
  const label = raw?.label ?? raw?.title ?? raw?.path ?? "Untitled"
  const kids = (raw?.children ?? raw?.items ?? []) as any[]
  return { path, label, children: kids.map(normalizeNode) }
}
function normalizeRoot(raw:any):Node{
  if(Array.isArray(raw)) return { path:"/overview", label:"Overview", children: raw.map(normalizeNode) }
  if(raw && Array.isArray(raw.items)) return { path:"/overview", label:"Overview", children: raw.items.map(normalizeNode) }
  return normalizeNode(raw||{})
}

export default function OverviewTiles({clientId,returnId}:{clientId:string;returnId:string}){
  const [root,setRoot]=useState<Node|null>(null)
  const [err,setErr]=useState<string>("")
  useEffect(()=>{
    let alive=true
    fetch(`/api/return/${encodeURIComponent(returnId)}/questionnaire/tree`)
      .then(r=>r.ok?r.json():Promise.reject(String(r.status)))
      .then(j=>{ if(alive) setRoot(normalizeRoot(j)) })
      .catch(e=>{ if(alive) setErr(String(e)) })
    return ()=>{ alive=false }
  },[returnId])
  if(err) return <div className="text-sm text-red-600">Failed to load workflow tree</div>
  if(!root) return <div className="text-sm opacity-70">Loading…</div>
  const top = root.children||[]
  if(top.length===0) return <div className="text-sm opacity-70">No sections yet</div>
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {top.map(n=>(
        <Link key={n.path} href={`/client/${clientId}/flow/${returnId}${n.path}`} className="block border rounded-2xl p-5 hover:shadow">
          <div className="text-lg font-semibold mb-1">{n.label}</div>
          <div className="text-sm opacity-70">{n.children&&n.children.length>0?`${n.children.length} subpages`:"Open"}</div>
        </Link>
      ))}
    </div>
  )
}
