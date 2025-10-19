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
    const contrib=parseFloat((fd.get("contrib") as string)||"0")||0;
    const employer=parseFloat((fd.get("employer") as string)||"0")||0;
    const withdraw=parseFloat((fd.get("withdraw") as string)||"0")||0;
    const hasAmount=contrib>0||employer>0||withdraw>0;
    const hasFile=Boolean(fd.get("pension_docs"));
    setData("income/pensions",{ contrib, employer, withdraw });
    setStatus("income/pensions", hasAmount ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Pensions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MoneyInput name="contrib" label="Your contributions" placeholder="0.00" />
        <MoneyInput name="employer" label="Employer contributions" placeholder="0.00" />
        <MoneyInput name="withdraw" label="Withdrawals" placeholder="0.00" />
      </div>
      <UploadBox name="pension_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
