"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Node = { key: string; title: string; path: string; children?: Node[] };

function Item({ n, base }: { n: Node; base: string }) {
  return (
    <div className="ml-4 my-1">
      <a href={`${base}${n.path}`} className="text-blue-600 hover:underline">{n.title}</a>
      {n.children?.length ? <div className="ml-4">
        {n.children.map(c => <Item key={c.key} n={c} base={base} />)}
      </div> : null}
    </div>
  );
}

export default function Page() {
  const p = useParams() as any;
  const clientId = p.clientId as string;
  const returnId = p.returnId as string;
  const [tree, setTree] = useState<Node[]>([]);
  useEffect(() => {
    fetch(`/api/return/${returnId}/questionnaire/tree`, { cache: "no-store" })
      .then(r => r.json()).then(j => setTree(j?.tree || [])).catch(() => setTree([]));
  }, [returnId]);
  const base = `/client/${clientId}/flow/${returnId}`;
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-4">Overview</h1>
      {tree.length === 0 ? <p>No sections yet</p> : tree.map(n => <Item key={n.key} n={n} base={base} />)}
    </div>
  );
}
