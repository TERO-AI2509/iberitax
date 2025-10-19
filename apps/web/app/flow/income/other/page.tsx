"use client";
import { useState } from "react";
import UploadBox from "@/components/flow/UploadBox";
import { useReturnStore } from "@/components/flow/store";
import MoneyInput from "@/components/flow/inputs/MoneyInput";
export default function Page(){
  const setStatus=useReturnStore(s=>s.setStatus);
  const setData=useReturnStore(s=>s.setData);
  const [saved,setSaved]=useState(false);
  function onSave(fd:FormData){
    const type=(fd.get("type") as string)||"";
    const amount=parseFloat((fd.get("amount") as string)||"0")||0;
    const has=Boolean(type)||amount>0;
    const hasFile=Boolean(fd.get("other_docs"));
    setData("income/other",{ type, amount });
    setStatus("income/other", has ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Other income</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Type</label>
          <input name="type" type="text" className="w-full rounded-md border p-2" />
        </div>
        <MoneyInput name="amount" label="Amount" placeholder="0.00" />
      </div>
      <UploadBox name="other_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
