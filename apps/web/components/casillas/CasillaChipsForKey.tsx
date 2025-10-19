"use client";
import React, { useEffect, useState } from "react";

type MapRow = { key: string; casilla: string | number; label?: string };

export default function CasillaChipsForKey({ prefix }: { prefix: string }) {
  const [rows, setRows] = useState<MapRow[]>([]);
  useEffect(() => {
    async function load() {
      const r = await fetch("/api/mapping", { cache: "no-store" });
      if (!r.ok) return;
      const j = await r.json();
      const list: MapRow[] = Array.isArray(j?.rows) ? j.rows : [];
      setRows(list.filter((x) => typeof x?.key === "string" && x.key.startsWith(prefix)));
    }
    load();
  }, [prefix]);

  if (!rows.length) return null;

  return (
    <div className="mt-2 flex gap-2 flex-wrap">
      {rows.map((r) => (
        <span key={`${r.key}-${r.casilla}`} className="px-2 py-1 text-xs rounded-full border">
          #{r.casilla}
        </span>
      ))}
    </div>
  );
}
