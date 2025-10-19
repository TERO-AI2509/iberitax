"use client";
import { useState } from "react";
import MoneyInput from "@/components/flow/inputs/MoneyInput";
import UploadBox from "@/components/flow/UploadBox";
import { useReturnStore } from "@/components/flow/store";
export default function Page(){
  const setStatus=useReturnStore(s=>s.setStatus);
  const setData=useReturnStore(s=>s.setData);
  const [saved,setSaved]=useState(false);
  function onSave(fd:FormData){
    const ibi=parseFloat((fd.get("ibi") as string)||"0")||0;
    const fees=parseFloat((fd.get("fees") as string)||"0")||0;
    const hasAmount=ibi>0||fees>0;
    const hasFile=Boolean(fd.get("owner_docs2"));
    setData("deductions/housing/owner",{ ibi, fees });
    setStatus("deductions/housing/owner", hasAmount ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Housing — Owner (Details)</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MoneyInput name="ibi" label="IBI paid" placeholder="0.00" />
        <MoneyInput name="fees" label="Community fees" placeholder="0.00" />
      </div>
      <UploadBox name="owner_docs2" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
