"use client";

import { useState, useRef } from "react";

type InitResp = { ok: boolean; url: string; downloadUrl?: string; storageKey?: string };

const STUB_BASE = process.env.NEXT_PUBLIC_STUB_BASE || "http://127.0.0.1:4000";

export default function UploadPage() {
  const [status, setStatus] = useState<string>("");
  const [link, setLink] = useState<string>("");
  const [busy, setBusy] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function initUpload(originalName: string): Promise<InitResp> {
    try {
      const r = await fetch(`${STUB_BASE}/api/initUpload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalName })
      });
      if (r.ok) return await r.json();
    } catch {}
    const r2 = await fetch(`${STUB_BASE}/api/initUpload?originalName=${encodeURIComponent(originalName)}`);
    if (!r2.ok) throw new Error(`initUpload failed`);
    return await r2.json();
  }

  async function resolveByKey(storageKey: string): Promise<{ fileUrl?: string; dlUrl?: string } | null> {
    try {
      const r = await fetch(`${STUB_BASE}/resolve?key=${encodeURIComponent(storageKey)}`);
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  }

  async function putWithProgress(url: string, file: File) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgress(pct);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`PUT failed ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.send(file);
    });
  }

  async function onSelect(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    setBusy(true);
    setStatus("Requesting upload URL…");
    setLink("");
    setProgress(0);

    try {
      const init = await initUpload(file.name);
      if (!init || !init.url) throw new Error("initUpload invalid");

      setStatus("Uploading to storage…");
      await putWithProgress(init.url, file);

      let openUrl = init.downloadUrl || "";
      if (!openUrl && init.storageKey) {
        setStatus("Resolving link…");
        const r = await resolveByKey(init.storageKey);
        openUrl = r?.fileUrl || r?.dlUrl || "";
      }

      if (!openUrl) throw new Error("Could not determine file URL");
      setLink(`${STUB_BASE}${openUrl.startsWith("/") ? "" : "/"}${openUrl}`);
      setStatus("Done");
    } catch (e: any) {
      setStatus(String(e?.message || e));
    } finally {
      setBusy(false);
    }
  }

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    await onSelect(e.target.files);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function copyLink() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Upload a file</h1>

      <input
        ref={inputRef}
        type="file"
        className="mb-4"
        onChange={onChange}
        disabled={busy}
      />

      {busy && (
        <div className="mb-2">
          <div className="h-2 bg-gray-200 rounded">
            <div className="h-2 bg-black rounded" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="mb-2">{status}</div>

      {!!link && (
        <div className="flex items-center gap-3">
          <a href={link} target="_blank" className="underline break-all">{link}</a>
          <button
            onClick={copyLink}
            className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
            disabled={!link}
          >
            Copy link
          </button>
        </div>
      )}
    </div>
  );
}
