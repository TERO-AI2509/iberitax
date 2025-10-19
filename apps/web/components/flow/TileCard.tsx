"use client";
import { useRouter } from "next/navigation";
type Props = { title: string; href: string; status?: "pending"|"entered"|"uploaded"|"complete" };
export default function TileCard({ title, href, status="pending" }: Props){
  const r = useRouter();
  return (
    <button onClick={()=>r.push(href)} className="w-full rounded-2xl border p-5 text-left shadow-sm transition hover:shadow focus:outline-none focus:ring-2 focus:ring-offset-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs rounded-full px-2 py-1 border">
          {status==="entered"?"Entered":status==="uploaded"?"Uploaded":status==="complete"?"Complete":"Pending"}
        </span>
      </div>
    </button>
  );
}
