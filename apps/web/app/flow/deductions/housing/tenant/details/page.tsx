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
    const deposit=parseFloat((fd.get("deposit") as string)||"0")||0;
    const agency=parseFloat((fd.get("agency") as string)||"0")||0;
    const hasAmount=deposit>0||agency>0;
    const hasFile=Boolean(fd.get("tenant_docs2"));
    setData("deductions/housing/tenant",{ deposit, agency });
    setStatus("deductions/housing/tenant", hasAmount ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Housing — Tenant (Details)</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MoneyInput name="deposit" label="Deposit paid or adjusted" placeholder="0.00" />
        <MoneyInput name="agency" label="Agency fees" placeholder="0.00" />
      </div>
      <UploadBox name="tenant_docs2" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
