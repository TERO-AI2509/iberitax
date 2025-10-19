"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Node = { key: string; title: string; path: string; children?: Node[]; parent?: string };
async function fetchTree(returnId: string): Promise<Node[]> {
  const r = await fetch(`/api/return/${returnId}/questionnaire/tree`, { cache: "no-store" });
  const j = await r.json();
  return j?.tree || [];
}
function flatten(nodes: Node[], parent?: string): Node[] {
  return nodes.flatMap(n => {
    const self = { ...n, parent };
    return [self, ...flatten(n.children || [], n.key)];
  });
}

export default function BranchNavControls({ clientId, returnId, nodeKey }: { clientId: string; returnId: string; nodeKey: string }) {
  const [flat, setFlat] = useState<Node[]>([]);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetchTree(returnId).then(t => setFlat(flatten(t)));
  }, [returnId]);

  const here = flat.find(n => n.key === nodeKey);
  const branchRootKey = here?.parent ?? here?.key;
  const branch = flat.filter(n => n.key === branchRootKey || n.parent === branchRootKey);
  const idx = branch.findIndex(n => n.key === nodeKey);

  const back = idx > 0 ? branch[idx - 1] : null;
  const next = idx >= 0 && idx < branch.length - 1 ? branch[idx + 1] : null;
  const up = branch.find(n => n.key === branchRootKey) || null;

  function go(to?: Node | null) {
    if (!to) return;
    const path = `/client/${clientId}/flow/${returnId}${to.path}`;
    if (path !== pathname) router.push(path);
  }

  return (
    <div className="flex gap-2 justify-between">
      <button className="btn" onClick={() => go(back)} disabled={!back}>Back</button>
      <button className="btn" onClick={() => go(up)} disabled={!up}>Up</button>
      <button className="btn" onClick={() => router.push(`/client/${clientId}/flow/${returnId}/overview`)}>Overview</button>
      <button className="btn" onClick={() => go(next)} disabled={!next}>Next</button>
    </div>
  );
}
