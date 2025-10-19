"use client"
import { useEffect, useRef, useState } from "react"

type Field = { name:string; label:string; type:"text"|"number"|"checkbox" }

function setDeep(obj:any, path:string, value:any){
  const parts = path.replace(/\[(\d+)\]/g,'.$1').split('.')
  let cur=obj
  for(let i=0;i<parts.length-1;i++){
    const k=parts[i]
    if(!(k in cur) || cur[k]==null) cur[k] = isFinite(Number(parts[i+1])) ? [] : {}
    cur = cur[k]
  }
  cur[parts[parts.length-1]] = value
}
function getDeep(obj:any, path:string){
  if(!obj) return undefined
  const parts = path.replace(/\[(\d+)\]/g,'.$1').split('.')
  let cur=obj
  for(const k of parts){
    if(cur==null) return undefined
    cur = cur[k]
  }
  return cur
}

export default function SimpleAnswerForm({returnId,keyPath,fields}:{returnId:string;keyPath:string;fields:Field[]}) {
  const [data,setData]=useState<any>({})
  const [saving,setSaving]=useState(false)
  const tRef=useRef<any>(0)

  // Load existing
  useEffect(()=>{
    let alive=true
    fetch(`/api/answers?returnId=${encodeURIComponent(returnId)}&area=${encodeURIComponent(keyPath)}`)
      .then(r=>r.json()).then(j=>{ if(alive) setData(j||{}) })
      .catch(()=>{ if(alive) setData({}) })
    return ()=>{ alive=false }
  },[returnId,keyPath])

  function queueSave(next:any){
    setData(next)
    window.clearTimeout(tRef.current)
    tRef.current = window.setTimeout(save, 600)
  }

  function handleChange(f:Field, rawEvent:React.ChangeEvent<HTMLInputElement>){
    const el = rawEvent.currentTarget
    const next = structuredClone(data||{})
    const val =
      f.type==="checkbox" ? el.checked :
      f.type==="number"   ? (el.value==="" ? "" : (Number.isFinite(parseFloat(el.value)) ? parseFloat(el.value) : 0))
                          : el.value
    setDeep(next, f.name, val)
    queueSave(next)
  }

  async function save(){
    setSaving(true)
    try{
      await fetch(`/api/answers?returnId=${encodeURIComponent(returnId)}&area=${encodeURIComponent(keyPath)}`,{
        method:"PUT",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(data||{})
      })
    } finally{
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {fields.map(f=>{
        const v = getDeep(data,f.name)
        return (
          <div key={f.name} className="flex items-center gap-3">
            <label className="w-64">{f.label}</label>
            {f.type==="checkbox" ? (
              <input type="checkbox" checked={!!v} onChange={e=>handleChange(f,e)} />
            ) : (
              <input
                className="border rounded px-3 py-1"
                type={f.type}
                value={v===undefined ? "" : v}
                onChange={e=>handleChange(f,e)}
              />
            )}
          </div>
        )
      })}
      <button onClick={save} className="px-3 py-2 rounded bg-emerald-600 text-white">Save</button>
      {saving && <span className="text-xs opacity-70 ml-2">Saving…</span>}
    </div>
  )
}
