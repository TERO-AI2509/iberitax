import { execFile } from "node:child_process";
import { promisify } from "node:util";

const pexec = promisify(execFile);
const BASE = process.env.STUB_BASE || "http://127.0.0.1:4000";

async function sh(cmd, args) {
  const { stdout } = await pexec(cmd, args, { maxBuffer: 10_000_000 });
  return stdout;
}

async function head(url) {
  const out = await sh("curl", ["-sS", "-I", url]);
  return out;
}

function getHeader(h, name) {
  const lines = h.split(/\r?\n/);
  const n = name.toLowerCase();
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const k = line.slice(0, idx).trim().toLowerCase();
      const v = line.slice(idx + 1).trim();
      if (k === n) return v;
    }
  }
  return "";
}

async function fetchJSON(url) {
  const text = await sh("curl", ["-sS", url]);
  return JSON.parse(text);
}

async function checkType(query, expectPrefix) {
  const list = await fetchJSON(`${BASE}/recent-uploads${query}`);
  if (!Array.isArray(list)) throw new Error("unexpected payload");
  if (list.length === 0) return true;
  const one = list[0];
  const url = `${BASE}${one.url.startsWith("/") ? "" : "/"}${one.url}`;
  const h = await head(url);
  const ct = getHeader(h, "content-type").toLowerCase();
  if (!ct.startsWith(expectPrefix)) throw new Error(`bad content-type for ${url}: ${ct}`);
  return true;
}

async function main() {
  await checkType("?mime=image/*&limit=1", "image/");
  await checkType("?mime=application/pdf&limit=1", "application/pdf");
  console.log("ok");
}

main().catch(e => {
  console.error(String(e && e.message ? e.message : e));
  process.exit(1);
});
