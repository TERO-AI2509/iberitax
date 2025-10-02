import React, { useState } from "react";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [key, setKey] = useState<string | null>(null);
  const [extractResult, setExtractResult] = useState<any>(null);

  async function handleUpload() {
    try {
      setStatus("Uploading...");
      setExtractResult(null);
      if (!file) throw new Error("Pick a file first");
      const contentType = file.type || "application/pdf";
      const size = file.size;

      // 1) init
      const initRes = await fetch(`${BASE}/uploader/init`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType, size })
      });
      const initJson = await initRes.json();
      if (!initRes.ok || !initJson?.ok) throw new Error(initJson?.error || "init failed");

      const { putURL, key } = initJson.data as { putURL: string; key: string };
      setKey(key);

      // 2) PUT binary
      const putRes = await fetch(`${BASE}${putURL}`, {
        method: "PUT",
        headers: { "content-type": contentType, "content-length": String(size) },
        body: file
      });
      const putJson = await putRes.json().catch(() => ({}));
      if (!putRes.ok || putJson?.ok !== true) throw new Error(putJson?.error || "put failed");

      setStatus("✅ Uploaded OK");
    } catch (e: any) {
      setStatus("❌ " + (e?.message || String(e)));
    }
  }

  async function handleExtract() {
    if (!key) return;
    setStatus("Calling extractor...");
    const res = await fetch(`${BASE}/extract`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key })
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus("❌ Extract failed");
    } else {
      setStatus("✅ Extract OK");
      setExtractResult(json);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "2rem auto", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <h1>Upload & Extract (MVP)</h1>
      <p style={{ color: "#666" }}>API: <code>{BASE}</code></p>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        style={{ display: "block", margin: "1rem 0" }}
      />

      <button onClick={handleUpload} disabled={!file} style={{ padding: "0.5rem 1rem" }}>
        Upload
      </button>

      {status && <p style={{ marginTop: "1rem" }}>{status}</p>}

      {key && (
        <div style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ddd", borderRadius: 8 }}>
          <div><strong>Storage key:</strong> <code>{key}</code></div>
          <button onClick={handleExtract} style={{ marginTop: "0.75rem", padding: "0.5rem 1rem" }}>
            Extract with this key
          </button>
        </div>
      )}

      {extractResult && (
        <pre style={{ marginTop: "1rem", padding: "1rem", background: "#fafafa", borderRadius: 8, overflowX: "auto" }}>
{JSON.stringify(extractResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
