import { execFile } from "node:child_process";
import { promisify } from "node:util";

const pexec = promisify(execFile);
const BASE = process.env.STUB_BASE || "http://127.0.0.1:4000";

async function sh(cmd, args) {
  const { stdout } = await pexec(cmd, args, { maxBuffer: 10_000_000 });
  return stdout;
}

async function main() {
  const initRaw = await sh("curl", ["-sS", `${BASE}/api/initUpload?originalName=dummy.pdf`]);
  const init = JSON.parse(initRaw);
  if (!init?.url) throw new Error("no url from initUpload");
  await sh("curl", ["-sS", "-X", "PUT", "-T", "tests/fixtures/dummy.pdf", init.url]);
  const dl = init.downloadUrl || "";
  const key = init.storageKey || "";
  let finalUrl = dl ? `${BASE}${dl.startsWith("/") ? "" : "/"}${dl}` : "";
  if (!finalUrl && key) {
    const rRaw = await sh("curl", ["-sS", `${BASE}/resolve?key=${encodeURIComponent(key)}`]);
    const rj = JSON.parse(rRaw);
    finalUrl = rj.fileUrl ? `${BASE}${rj.fileUrl}` : rj.dlUrl ? `${BASE}${rj.dlUrl}` : "";
  }
  if (!finalUrl) throw new Error("could not resolve final URL");
  const head = await pexec("curl", ["-sS", "-I", finalUrl]).catch(() => ({ stdout: "" }));
  if (!/200 OK/i.test(String(head.stdout))) throw new Error("final URL not reachable");
  console.log("ok");
}

main().catch(e => {
  console.error(String(e && e.message ? e.message : e));
  process.exit(1);
});
