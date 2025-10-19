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
    const es=parseFloat((fd.get("es") as string)||"0")||0;
    const foreign=parseFloat((fd.get("foreign") as string)||"0")||0;
    const hasAmount=amount>0||es>0||foreign>0;
    const hasFile=Boolean(fd.get("div_docs"));
    setData("income/investments/dividends",{ amount, es, foreign });
    setStatus("income/investments/dividends", hasAmount ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Investments — Dividends</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MoneyInput name="amount" label="Dividends received" placeholder="0.00" />
        <MoneyInput name="es" label="ES withholding" placeholder="0.00" />
        <MoneyInput name="foreign" label="Foreign withholding" placeholder="0.00" />
      </div>
      <UploadBox name="div_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
