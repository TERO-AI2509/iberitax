"use client";
import MoneyInput from "@/components/flow/inputs/MoneyInput";
import UploadBox from "@/components/flow/UploadBox";
import { useReturnStore } from "@/components/flow/store";
import { useState } from "react";
export default function Page(){
  const setStatus=useReturnStore(s=>s.setStatus);
  const setData=useReturnStore(s=>s.setData);
  const [saved,setSaved]=useState(false);
  function onSave(form:FormData){
    const salary=parseFloat(form.get("salary") as string)||0;
    const irpf=parseFloat(form.get("irpf") as string)||0;
    const ss=parseFloat(form.get("ss") as string)||0;
    const hasAmount=salary>0||irpf>0||ss>0;
    setData("income/salary",{ salary, irpf, ss });
    setStatus("income/salary", hasAmount ? "entered" : "uploaded");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Salary</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MoneyInput name="salary" label="Salary gross amount" placeholder="0.00" />
        <MoneyInput name="irpf" label="IRPF withheld" placeholder="0.00" />
        <MoneyInput name="ss" label="Social Security contributions" placeholder="0.00" />
      </div>
      <UploadBox name="salary_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
