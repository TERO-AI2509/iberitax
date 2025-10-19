"use client";
import UploadBox from "@/components/flow/UploadBox";
import { useReturnStore } from "@/components/flow/store";
import { useState } from "react";
export default function Page(){
  const setStatus=useReturnStore(s=>s.setStatus);
  const setData=useReturnStore(s=>s.setData);
  const [saved,setSaved]=useState(false);
  function onSave(fd:FormData){
    const marital=(fd.get("marital") as string)||"";
    const household=(fd.get("household") as string)||"";
    const hasFields=Boolean(marital || household);
    const hasFile=Boolean(fd.get("family_docs"));
    setData("family/marital",{ marital, household });
    setStatus("family/marital", hasFields ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Family — Marital status</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Marital status</label>
          <select name="marital" className="w-full rounded-md border p-2">
            <option value="">Select</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="pareja">Pareja de hecho</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Household</label>
          <select name="household" className="w-full rounded-md border p-2">
            <option value="">Select</option>
            <option value="you">You alone</option>
            <option value="spouse">With spouse/partner</option>
            <option value="dependents">With dependents</option>
            <option value="both">Spouse/partner and dependents</option>
          </select>
        </div>
      </div>
      <UploadBox name="family_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
