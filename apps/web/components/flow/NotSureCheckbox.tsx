"use client"
import { useState } from "react"
export default function NotSureCheckbox({ returnId, section, jsonPath }: { returnId: string, section: string, jsonPath: string }) {
  const [checked, setChecked] = useState(false)
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={async(e)=>{ const v=e.target.checked; setChecked(v); if(v){ await fetch(`/api/return/${returnId}/flags/unsure`, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ section, path: jsonPath }) }) } }} />
      <span>I’m not sure — please double-check this later.</span>
    </label>
  )
}
