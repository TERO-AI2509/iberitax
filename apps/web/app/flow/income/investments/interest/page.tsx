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
    const amount=parseFloat((fd.get("amount") as string)||"0")||0;
    const withh=parseFloat((fd.get("withholding") as string)||"0")||0;
    const hasAmount=amount>0||withh>0;
    const hasFile=Boolean(fd.get("interest_docs"));
    setData("income/investments/interest",{ amount, withh });
    setStatus("income/investments/interest", hasAmount ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Investments — Interest</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MoneyInput name="amount" label="Interest received" placeholder="0.00" />
        <MoneyInput name="withholding" label="Withholding tax" placeholder="0.00" />
      </div>
      <UploadBox name="interest_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
