"use client";
import { useState } from "react";
import UploadBox from "@/components/flow/UploadBox";
import { useReturnStore } from "@/components/flow/store";
export default function Page(){
  const setStatus=useReturnStore(s=>s.setStatus);
  const setData=useReturnStore(s=>s.setData);
  const [saved,setSaved]=useState(false);
  function onSave(fd:FormData){
    const name=(fd.get("name") as string)||"";
    const nif=(fd.get("nif") as string)||"";
    const filing=(fd.get("filing") as string)||"";
    const has=Boolean(name||nif||filing);
    const hasFile=Boolean(fd.get("spouse_docs"));
    setData("family/spouse",{ name,nif,filing });
    setStatus("family/spouse", has ? "entered" : hasFile ? "uploaded" : "pending");
    setSaved(true);
  }
  return (
    <form action={(fd)=>onSave(fd)} className="space-y-6">
      <h2 className="text-xl font-semibold">Spouse / Pareja de hecho</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name</label>
          <input name="name" type="text" className="w-full rounded-md border p-2" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">NIF</label>
          <input name="nif" type="text" className="w-full rounded-md border p-2" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Filing</label>
          <select name="filing" className="w-full rounded-md border p-2">
            <option value="">Select</option>
            <option value="joint">Joint</option>
            <option value="separate">Separate</option>
          </select>
        </div>
      </div>
      <UploadBox name="spouse_docs" />
      <button type="submit" className="rounded-md border px-4 py-2">Save</button>
      {saved && <p className="text-sm text-green-600">Saved</p>}
    </form>
  );
}
