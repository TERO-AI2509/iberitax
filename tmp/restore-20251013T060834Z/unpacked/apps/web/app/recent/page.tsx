"use client";

import { useEffect, useState } from "react";

type Item = {
  key: string;
  path: string;
  fileName: string;
  originalName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  mtimeMs?: number | null;
  url: string;
  dlUrl: string;
};

function humanSize(n?: number | null) {
  if (n == null) return "";
  const units = ["B","KB","MB","GB","TB"];
  let v = n;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v = v / 1024;
    u++;
  }
  return `${v.toFixed(1)} ${units[u]}`;
}

function humanDate(ms?: number | null) {
  if (!ms) return "";
  const d = new Date(ms);
  return d.toLocaleString();
}

function useDebounced<T>(value: T, ms: number) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function RecentPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all"|"images"|"docs">("all");
  const debouncedQ = useDebounced(q, 250);
  const [sort, setSort] = useState<"mtime"|"name"|"size">("mtime");
  const [dir, setDir] = useState<"asc"|"desc">("desc");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 5;

  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
  }, [debouncedQ, sort, dir, type]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedQ) params.set("q", debouncedQ);
        params.set("sort", sort);
        params.set("dir", dir);
        params.set("limit", String(PAGE_SIZE));
        params.set("offset", String(page * PAGE_SIZE));
        if (type === "images") {
          params.set("mimeTypes", "image/*");
        } else if (type === "docs") {
          params.set("ext", "pdf,rtf");
        }
        const url = `http://127.0.0.1:4000/recent-uploads?${params.toString()}`;
        const resp = await fetch(url, { cache: "no-store" });
        const data = await resp.json();
        if (!cancelled) {
          if (page === 0) setItems(Array.isArray(data) ? data : []);
          else setItems(prev => [...prev, ...(Array.isArray(data) ? data : [])]);
          if (!Array.isArray(data) || data.length < PAGE_SIZE) setHasMore(false);
        }
      } catch {
        if (!cancelled && page === 0) setItems([]);
        setHasMore(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [debouncedQ, sort, dir, type, page]);

  async function onDelete(it: Item) {
    if (!confirm(`Delete ${it.fileName}?`)) return;
    const params = new URLSearchParams({ key: it.path });
    const url = `http://127.0.0.1:4000/api/files?${params.toString()}`;
    const resp = await fetch(url, { method: "DELETE" });
    const data = await resp.json().catch(() => ({}));
    if (data && data.ok) {
      setItems(prev => prev.filter(x => x.key !== it.key));
    } else {
      alert("Delete failed");
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Recent uploads</h1>
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name…"
          className="border rounded-xl px-3 py-2 w-64"
        />
        <select
          value={type}
          onChange={e => setType(e.target.value as any)}
          className="border rounded-xl px-3 py-2"
        >
          <option value="all">All types</option>
          <option value="images">Images</option>
          <option value="docs">Documents (PDF/RTF)</option>
        </select>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="border rounded-xl px-3 py-2"
        >
          <option value="mtime">Newest</option>
          <option value="name">Name</option>
          <option value="size">Size</option>
        </select>
        <button
          onClick={() => setDir(d => d === "asc" ? "desc" : "asc")}
          className="border rounded-xl px-3 py-2"
        >
          {dir === "asc" ? "Asc" : "Desc"}
        </button>
        {loading ? <span className="text-sm opacity-70">Loading…</span> : null}
      </div>
      <ul className="grid grid-cols-1 gap-2">
        {items.map(it => (
          <li key={it.key} className="border rounded-xl p-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-medium truncate">{it.fileName}</div>
              {it.originalName ? <div className="text-sm opacity-70 truncate">{it.originalName}</div> : null}
              <div className="text-xs opacity-70">{humanSize(it.size)} • {humanDate(it.mtimeMs)}</div>
            </div>
            <div className="flex gap-2">
              <a href={it.url} target="_blank" rel="noreferrer" className="underline">Open</a>
              <a href={it.dlUrl} target="_blank" rel="noreferrer" className="underline">Download</a>
              <button onClick={() => onDelete(it)} className="border rounded-xl px-3 py-1">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      {hasMore && !loading && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="border rounded-xl px-4 py-2 mt-4"
        >
          Load more
        </button>
      )}
      {items.length === 0 && !loading ? <div className="opacity-70">No files</div> : null}
    </div>
  );
}
