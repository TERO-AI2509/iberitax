"use client";
type Props={ name:string; label:string; placeholder?:string; defaultValue?:number|string };
export default function MoneyInput({ name,label,placeholder,defaultValue }:Props){
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input name={name} type="number" step="0.01" placeholder={placeholder} defaultValue={defaultValue} className="w-full rounded-md border p-2" />
    </div>
  );
}
