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
  return nodes.flatMap((n) => {
    const self = { ...n, parent };
    return [self, ...flatten(n.children || [], n.key)];
  });
}

type Props = { clientId: string; returnId: string; nodeKey?: string };

export default function BranchNavControls({ clientId, returnId, nodeKey }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [flat, setFlat] = useState<Node[]>([]);

  useEffect(() => {
    fetchTree(returnId).then((tree) => setFlat(flatten(tree)));
  }, [returnId]);

  const idx = nodeKey ? flat.findIndex((n) => n.key === nodeKey) : flat.findIndex((n) => pathname?.endsWith(n.path));
  const back = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  const up = idx >= 0 ? flat.find((n) => n.key === flat[idx].parent) || null : null;

  function go(to: Node | null) {
    if (!to) return;
    const path = `/client/${clientId}/flow/${returnId}${to.path}`;
    if (path !== pathname) router.push(path);
  }

  const btn = "inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm font-medium shadow-sm bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed";
  const primary = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold shadow-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className="branch-nav mt-4 flex flex-wrap items-center gap-2">
      <button className={btn} onClick={() => go(back)} disabled={!back}>Back</button>
      <button className={btn} onClick={() => go(up)} disabled={!up}>Up</button>
      <button className={btn} onClick={() => router.push(`/client/${clientId}/flow/${returnId}/overview`)}>Overview</button>
      <button className={primary} onClick={() => go(next)} disabled={!next}>Next</button>
    </div>
  );
}
