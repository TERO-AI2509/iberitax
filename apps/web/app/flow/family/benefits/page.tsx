"use client";
import { useState } from "react";
import UploadBox from "@/components/flow/UploadBox";
import { useReturnStore } from "@/components/flow/store";
export default function Page(){
  const setStatus=useReturnStore(s=>s.setStatus);
  const setData=useReturnStore(s=>s.setData);
  const [saved,setSaved]=useState(false);
  function onSave(fd:FormData){
    const large=(fd.get("large") as string)||"";
    const disability=(fd.get("disability") as string)||"";
    const single=(fd.get("single") as string)||"";
    const has=Boolean(large||disability||single);
    const hasFile=Boolean(fd.get("benefit_docs"));
    setData("family/benefits",{ large, disability, single });
    setStatus("family/benefits", has ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Family benefits</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Large family</label>
          <select name="large" className="w-full rounded-md border p-2">
            <option value="">No</option>
            <option value="general">General</option>
            <option value="especial">Especial</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Disability</label>
          <select name="disability" className="w-full rounded-md border p-2">
            <option value="">No</option>
            <option value="you">You</option>
            <option value="spouse">Spouse</option>
            <option value="dependent">Dependent</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Single parent</label>
          <select name="single" className="w-full rounded-md border p-2">
            <option value="">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>
      <UploadBox name="benefit_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
