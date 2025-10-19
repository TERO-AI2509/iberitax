"use client"
import {useEffect,useRef,useState} from "react"

export default function MobileDrawer({triggerLabel="Menu",children}:{triggerLabel?:string;children?:React.ReactNode}) {
  const [open,setOpen]=useState(false)
  const panelRef=useRef<HTMLDivElement|null>(null)
  const buttonRef=useRef<HTMLButtonElement|null>(null)

  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="Escape") setOpen(false)
      if(e.key==="Tab" && open && panelRef.current){
        const focusables=panelRef.current.querySelectorAll<HTMLElement>('a,button,[tabindex]:not([tabindex="-1"]),input,select,textarea')
        if(focusables.length===0) return
        const first=focusables[0], last=focusables[focusables.length-1]
        const active=document.activeElement as HTMLElement|null
        if(e.shiftKey && active===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey && active===last){e.preventDefault();first.focus()}
      }
    }
    document.addEventListener("keydown",onKey)
    return()=>document.removeEventListener("keydown",onKey)
  },[open])

  useEffect(()=>{
    if(open){setTimeout(()=>{panelRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()},0)}
    else {buttonRef.current?.focus()}
  },[open])

  return(
    <>
      <button
        ref={buttonRef}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={()=>setOpen(true)}
        className="px-3 py-2 rounded-md border"
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-drawer-title"
          id="mobile-drawer"
          className="fixed inset-0 bg-black/40 z-50 grid"
          onClick={(e)=>{if(e.target===e.currentTarget) setOpen(false)}}
        >
          <div
            ref={panelRef}
            className="m-4 ml-auto w-80 max-w-[90vw] rounded-xl bg-white dark:bg-neutral-900 p-4 shadow-xl focus:outline-none"
            tabIndex={-1}
          >
            <div className="flex items-center justify-between mb-2">
              <h2 id="mobile-drawer-title" className="text-lg font-medium">Menu</h2>
              <button data-autofocus onClick={()=>setOpen(false)} className="px-2 py-1 rounded border">Close</button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  )
}
