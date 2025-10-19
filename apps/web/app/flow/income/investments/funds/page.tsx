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
    const dist=parseFloat((fd.get("dist") as string)||"0")||0;
    const proceeds=parseFloat((fd.get("proceeds") as string)||"0")||0;
    const cost=parseFloat((fd.get("cost") as string)||"0")||0;
    const hasAmount=dist>0||proceeds>0||cost>0;
    const hasFile=Boolean(fd.get("fund_docs"));
    setData("income/investments/funds",{ dist, proceeds, cost });
    setStatus("income/investments/funds", hasAmount ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Investments — Funds/ETFs</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MoneyInput name="dist" label="Distributions" placeholder="0.00" />
        <MoneyInput name="proceeds" label="Redemptions proceeds" placeholder="0.00" />
        <MoneyInput name="cost" label="Cost basis for redemptions" placeholder="0.00" />
      </div>
      <UploadBox name="fund_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
