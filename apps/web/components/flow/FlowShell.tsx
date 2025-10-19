"use client"
import { useEffect,useState } from "react"
import SidebarTree from "./SidebarTree"

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

export default function FlowShell({clientId,returnId,children}:{clientId:string;returnId:string;children:React.ReactNode}){
  const [tree,setTree]=useState<Node|null>(null)
  const [err,setErr]=useState<string>("")
  useEffect(()=>{
    let alive=true
    fetch(`/api/return/${encodeURIComponent(returnId)}/questionnaire/tree`)
      .then(r=>r.ok?r.json():Promise.reject(String(r.status)))
      .then(j=>{ if(alive) setTree(normalizeRoot(j)) })
      .catch(e=>{ if(alive) setErr(String(e)) })
    return ()=>{ alive=false }
  },[returnId])
  return (
    <div className="flex gap-6">
      <div className="w-64 shrink-0">
        {err && <div className="border rounded p-3 text-sm text-red-600">Failed to load workflow</div>}
        {!err && !tree && <div className="border rounded p-3 text-sm">Loading workflow…</div>}
        {tree && <SidebarTree clientId={clientId} returnId={returnId} tree={tree}/>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
