import type { ApiResult, ApiError } from "./api/result.js";

export type InitArgs = { filename: string; contentType: string; size?: number };
export type InitData = { key: string; putURL: string };

export function createUploaderClient(opts: { baseURL: string; fetchImpl?: typeof fetch }) {
  const baseURL = opts.baseURL.replace(/\/+$/, "");
  const fx = opts.fetchImpl ?? (globalThis.fetch as typeof fetch);

  async function initUpload(args: InitArgs): Promise<ApiResult<InitData>> {
    try {
      const res = await fx(`${baseURL}/uploader/init`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(args),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        let json: any = null;
        try { json = text ? JSON.parse(text) : null; } catch {}
        if (json && json.ok === false && json.code && json.error) {
          return json as ApiResult<InitData>;
        }
        return {
          ok: false,
          code: "InternalError",
          error: json?.error || (text || `HTTP ${res.status}`),
        } as ApiError as ApiResult<InitData>;
      }

      const json: any = await res.json().catch(() => null);
      if (json && json.ok === true && json.data?.key && json.data?.putURL) {
        return { ok: true, data: { key: json.data.key, putURL: json.data.putURL } };
      }
      return { ok: false, code: "InternalError", error: "Unexpected response shape" } as ApiResult<InitData>;
    } catch (err: any) {
      return { ok: false, code: "InternalError", error: String(err?.message ?? err) } as ApiResult<InitData>;
    }
  }

  return { initUpload };
}


/**
 * Upload a file/blob to a presigned/opaque PUT URL.
 * - In browsers, uses XMLHttpRequest to emit onProgress events.
 * - In Node/tests, falls back to fetch() (no progress events).
 */
export async function putFile(
  putURL: string,
  data: Blob | ArrayBuffer | Uint8Array,
  contentType: string,
  opts?: { baseURL?: string; onProgress?: (sent: number, total?: number) => void; fetchImpl?: typeof fetch }
) {
  try {
    const isAbs = /^https?:\/\//i.test(putURL);
    const base = (opts?.baseURL ?? "").replace(/\/+$/, "");
    const url = isAbs ? putURL : `${base}${putURL.startsWith("/") ? putURL : `/${putURL}`}`;

    // Browser path with progress
    if (typeof (globalThis as any).XMLHttpRequest !== "undefined") {
      const xhr = new (globalThis as any).XMLHttpRequest();
      const body =
        data instanceof Blob
          ? data
          : data instanceof Uint8Array
          ? new Blob([data as any], { type: contentType })
          : new Blob([data as ArrayBuffer], { type: contentType });
      const total = (body as Blob).size;

      return await new Promise((resolve) => {
        xhr.upload.onprogress = (evt: any) => {
          if (opts?.onProgress) opts.onProgress(evt.loaded, evt.total || total);
        };
        xhr.onerror = () => resolve({ ok: false, code: "InternalError", error: "Network error" });
        xhr.onload = () => {
          const ok = xhr.status >= 200 && xhr.status < 300;
          if (!ok) return resolve({ ok: false, code: "InternalError", error: `PUT failed: ${xhr.status}` });
          resolve({ ok: true, data: { bytes: total } });
        };
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.send(body);
      });
    }

    // Node/tests fallback
    const fx = opts?.fetchImpl ?? (globalThis.fetch as typeof fetch);
    const body =
      data instanceof Blob
        ? data
        : data instanceof Uint8Array
        ? data
        : new Uint8Array(data as ArrayBuffer);

    const res = await fx(url, { method: "PUT", headers: { "content-type": contentType }, body: body as any });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { ok: false, code: "InternalError", error: `PUT failed: ${res.status} ${t}` };
    }
    const bytes =
      data instanceof Blob
        ? data.size
        : data instanceof Uint8Array
        ? data.byteLength
        : (data as ArrayBuffer).byteLength;

    return { ok: true, data: { bytes } };
  } catch (err: any) {
    return { ok: false, code: "InternalError", error: String(err?.message ?? err) };
  }
}
