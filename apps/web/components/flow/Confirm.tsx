"use client";
import { useEffect } from "react";
type Props = { open: boolean; title: string; body?: string; confirmLabel?: string; cancelLabel?: string; onConfirm: ()=>void; onCancel: ()=>void; };
export default function Confirm({ open, title, body, confirmLabel="Remove", cancelLabel="Cancel", onConfirm, onCancel }: Props){
  useEffect(()=>{
    function onKey(e: KeyboardEvent){ if(!open) return; if(e.key==="Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  },[open,onCancel]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow">
        <h3 className="text-lg font-semibold">{title}</h3>
        {body ? <p className="mt-2 text-sm text-gray-600">{body}</p> : null}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded border px-4 py-2">{cancelLabel}</button>
          <button onClick={onConfirm} className="rounded border px-4 py-2">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
