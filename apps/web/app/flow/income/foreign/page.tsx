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
    const tax=parseFloat((fd.get("tax") as string)||"0")||0;
    const country=(fd.get("country") as string)||"";
    const hasAmount=amount>0||tax>0||country.length>0;
    const hasFile=Boolean(fd.get("foreign_docs"));
    setData("income/foreign",{ amount, tax, country });
    setStatus("income/foreign", hasAmount ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Foreign income</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MoneyInput name="amount" label="Amount received" placeholder="0.00" />
        <MoneyInput name="tax" label="Tax paid abroad" placeholder="0.00" />
        <div className="space-y-1">
          <label className="text-sm font-medium">Country</label>
          <input name="country" type="text" className="w-full rounded-md border p-2" />
        </div>
      </div>
      <UploadBox name="foreign_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
