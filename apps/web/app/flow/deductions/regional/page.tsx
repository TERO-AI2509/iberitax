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
    const hasAmount=amount>0;
    const hasFile=Boolean(fd.get("docs"));
    const key = window.location.pathname.replace(/^\/+/,"");
    const path = key.split("/").join("/");
    setData(path,{ amount });
    setStatus(path, hasAmount ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Deductions</h2>
      <MoneyInput name="amount" label="Amount" placeholder="0.00" />
      <UploadBox name="docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
