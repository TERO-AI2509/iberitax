"use client"
import {useEffect,useRef,useState} from "react"
import {announce} from "@/components/a11y/LiveRegion"

export default function ThemePreview(){
  const [open,setOpen]=useState(false)
  const triggerRef=useRef<HTMLButtonElement|null>(null)

  useEffect(()=>{
    if(!open) return
    const onKey=(e:KeyboardEvent)=>{ if(e.key==="Escape") setOpen(false) }
    window.addEventListener("keydown",onKey)
    return()=>window.removeEventListener("keydown",onKey)
  },[open])

  useEffect(()=>{
    if(!open && triggerRef.current) triggerRef.current.focus()
  },[open])

  return(
    <main id="main" className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Theme & A11y Preview</h1>

      <div className="flex gap-4 items-center">
        <a href="#" onClick={(e)=>e.preventDefault()} className="underline">Focusable Link</a>
        <button className="px-3 py-2 rounded-xl border focus-visible:outline-4 focus-visible:outline-offset-2" style={{outlineColor:"var(--tero-accent)"}}>Button</button>
        <input placeholder="Input" className="px-3 py-2 rounded-xl border" />
        <select className="px-3 py-2 rounded-xl border"><option>One</option><option>Two</option></select>
      </div>

      <div className="flex gap-4 items-center">
        <button onClick={()=>{announce("Saved successfully")}} className="px-3 py-2 rounded-xl border">Announce toast</button>
        <button ref={triggerRef} aria-haspopup="dialog" aria-expanded={open} aria-controls="demo-dialog" onClick={()=>setOpen(true)} className="px-3 py-2 rounded-xl border">Open dialog</button>
      </div>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="demo-title" id="demo-dialog" className="fixed inset-0 grid place-items-center bg-black/40">
          <div className="rounded-xl bg-white dark:bg-neutral-900 p-6 w-[90vw] max-w-md shadow-xl">
            <h2 id="demo-title" className="text-xl font-medium mb-4">Demo Dialog</h2>
            <p className="mb-4">Press Esc to close. Focus should return to the trigger button.</p>
            <button autoFocus onClick={()=>setOpen(false)} className="px-3 py-2 rounded-xl border">Close</button>
          </div>
        </div>
      )}
    </main>
  )
}
