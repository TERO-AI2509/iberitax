"use client";
import { useReturnStore } from "./store";
export default function ModeToggle(){
  const mode = useReturnStore(s=>s.mode);
  const setMode = useReturnStore(s=>s.setMode);
  return (
    <div className="mb-4 flex items-center gap-3 text-sm">
      <button
        onClick={()=>setMode(mode==="guided"?"browse":"guided")}
        className="rounded border px-3 py-1"
      >
        {mode==="guided" ? "Switch to Browse mode" : "Switch to Guided mode"}
      </button>
      <span className="text-xs opacity-70">Mode: {mode}</span>
    </div>
  );
}
