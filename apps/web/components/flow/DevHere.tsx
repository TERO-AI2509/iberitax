"use client";
import { usePathname } from "next/navigation";
export default function DevHere(){
  if (process.env.NODE_ENV === "production") return null as any;
  const path = usePathname() || "";
  return <div className="fixed bottom-2 right-2 text-[10px] opacity-70">here: {path}</div>;
}
