"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
type Node = { key: string; title: string; path: string; children?: Node[] };
export default function Page() {
  const p = useParams() as any;
  const clientId = p.clientId as string;
  const returnId = p.returnId as string;
  const [children, setChildren] = useState<Node[]>([]);
  useEffect(() => {
    fetch(`/api/return/${returnId}/questionnaire/tree`, { cache: "no-store" })
      .then(r => r.json()).then(j => {
        const node = (j?.tree || []).find((n: Node) => n.key === "capital-mobiliario");
        setChildren(node?.children || []);
      }).catch(() => setChildren([]));
  }, [returnId]);
  const base = `/client/${clientId}/flow/${returnId}`;
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Capital mobiliario</h1>
      {children.map(c => <div key={c.key}><a className="text-blue-600 hover:underline" href={base + c.path}>{c.title}</a></div>)}
    </div>
  );
}
