"use client";
import { useRouter } from "next/navigation";
import { useReturnStore } from "@/components/flow/store";
import Confirm from "@/components/flow/Confirm";
import { useMemo, useState } from "react";
type Item = { key:string; label:string; href:string };
const ITEMS: Item[] = [
  { key:"salary", label:"Salary", href:"/flow/income/salary" },
  { key:"autonomo", label:"Self-employed (autónomo)", href:"/flow/income/autonomo" },
  { key:"investments", label:"Investments", href:"/flow/income/investments" },
  { key:"rental", label:"Rental income", href:"/flow/income/rental" },
  { key:"pensions", label:"Pensions", href:"/flow/income/pensions" },
  { key:"foreign", label:"Foreign income", href:"/flow/income/foreign" },
  { key:"other", label:"Other income", href:"/flow/income/other" }
];
export default function Page(){
  const r = useRouter();
  const isSelected = useReturnStore(s=>s.isSelected);
  const select = useReturnStore(s=>s.select);
  const deselect = useReturnStore(s=>s.deselect);
  const hasData = useReturnStore(s=>s.hasData);
  const setStatus = useReturnStore(s=>s.setStatus);
  const [ask,setAsk]=useState<{open:boolean;key:string;label:string}>({open:false,key:"",label:""});
  const items = useMemo(()=>ITEMS,[]);
  function onItemClick(it:Item){
    if(!isSelected("income",it.key)){
      select("income",it.key);
      r.push(it.href);
      return;
    }
    const pathMap:Record<string,string>={
      salary:"income/salary",
      autonomo:"income/autonomo",
      investments:"income/investments",
      rental:"income/rental",
      pensions:"income/pensions",
      foreign:"income/foreign",
      other:"income/other"
    };
    const p = pathMap[it.key];
    if(p && hasData(p)){
      setAsk({open:true,key:it.key,label:it.label});
    }else{
      deselect("income",it.key);
      if(p) setStatus(p,"pending");
    }
  }
  function confirmRemove(){
    const k=ask.key;
    const pathMap:Record<string,string>={
      salary:"income/salary",
      autonomo:"income/autonomo",
      investments:"income/investments",
      rental:"income/rental",
      pensions:"income/pensions",
      foreign:"income/foreign",
      other:"income/other"
    };
    const p=pathMap[k];
    if(p){ useReturnStore.getState().clear(p); useReturnStore.getState().setStatus(p,"pending"); }
    deselect("income",k);
    setAsk({open:false,key:"",label:""});
  }
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Which income sources apply?</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map(it=>{
          const selected = isSelected("income",it.key);
          return (
            <button
              key={it.key}
              onClick={()=>onItemClick(it)}
              className={`rounded-xl border p-4 text-left transition ${selected?"shadow":"hover:shadow"}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{it.label}</span>
                <span className="text-xs rounded-full px-2 py-0.5 border">{selected?"Selected":"Select"}</span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-600">Click to select and open. Click again to deselect. If data exists, you will be asked to confirm.</p>
      <Confirm
        open={ask.open}
        title="Remove this income source?"
        body="You already entered information. Remove it and deselect?"
        confirmLabel="Remove and deselect"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={()=>setAsk({open:false,key:"",label:""})}
      />
    </div>
  );
}
