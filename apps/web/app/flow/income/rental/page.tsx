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
    const rent=parseFloat((fd.get("rent") as string)||"0")||0;
    const expenses=parseFloat((fd.get("expenses") as string)||"0")||0;
    const hasAmount=rent>0||expenses>0;
    const hasFile=Boolean(fd.get("rental_docs"));
    setData("income/rental",{ rent, expenses });
    setStatus("income/rental", hasAmount ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Rental income</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <MoneyInput name="rent" label="Rent received" placeholder="0.00" />
        <MoneyInput name="expenses" label="Deductible expenses" placeholder="0.00" />
      </div>
      <UploadBox name="rental_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
