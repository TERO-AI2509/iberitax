"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
type Node = { key: string; title: string; path: string; children?: Node[] };
function Item({ n, base, current }: { n: Node; base: string; current: string }) {
  const href = `${base}${n.path}`;
  const active = useMemo(() => current === href, [current, href]);
  return (
    <div className="ml-4 my-1">
      <a href={href} className={active ? "font-semibold text-blue-700" : "text-blue-600 hover:underline"}>{n.title}</a>
      {n.children?.length ? <div className="ml-4">{n.children.map(c => <Item key={c.key} n={c} base={base} current={current} />)}</div> : null}
    </div>
  );
}
export default function SidebarTree() {
  const p = useParams() as any;
  const pathname = usePathname();
  const clientId = p.clientId as string;
  const returnId = p.returnId as string;
  const [tree, setTree] = useState<Node[]>([]);
  useEffect(() => {
    fetch(`/api/return/${returnId}/questionnaire/tree`, { cache: "no-store" })
      .then(r => r.json()).then(j => setTree(j?.tree || []))
      .catch(() => setTree([]));
  }, [returnId]);
  const base = `/client/${clientId}/flow/${returnId}`;
  return (
    <div className="p-4 overflow-y-auto">
      {tree.map(n => <Item key={n.key} n={n} base={base} current={pathname || ""} />)}
    </div>
  );
}
