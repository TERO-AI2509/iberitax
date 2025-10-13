#!/usr/bin/env node
import { execSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

function sh(cmd, opts={stdio:"pipe"}) {
  return execSync(cmd, {encoding:"utf8", stdio:opts.stdio});
}
function tryBin(bin){ try{ sh(`command -v ${bin}`); return true; }catch{ return false; } }

const TS = new Date().toISOString().replace(/[-:]/g,"").replace(/\..+/,"Z");
const MODE = process.env.OFFSITE_MODE || "s3";
const S3_URI = process.env.OFFSITE_S3_URI || "";
const GH_REPO = process.env.GH_REPO || "";
const WORK = join("tmp", `restore-${TS}`);
const OUTDIR = "artifacts/backups";
mkdirSync(WORK, {recursive:true});
mkdirSync(OUTDIR, {recursive:true});

const state = { mode: MODE, startedAt: new Date().toISOString(), zip:"", shaFile:"", checksumMatch:false, smoke:[], durations:{} };

function pickLatestFromS3() {
  if (!tryBin("aws")) throw new Error("aws CLI not found");
  if (!S3_URI) throw new Error("OFFSITE_S3_URI required for s3 mode");
  const listing = sh(`aws s3 ls "${S3_URI}/"`);
  const names = listing.split("\n").map(l=>l.trim().split(/\s+/).pop()).filter(Boolean);
  const backups = names.filter(n=>/^backup-\d{8}T\d{6}Z\/?$/.test(n.replace(/\/$/,"")));
  if (!backups.length) throw new Error("No backups found at S3 URI");
  backups.sort();
  const latest = backups.pop().replace(/\/$/,"");
  const keyBase = `${S3_URI}/${latest}/${latest}.zip`;
  const shaKey = `${keyBase}.sha256`;
  const localZip = join(WORK, `${latest}.zip`);
  const localSha = join(WORK, `${latest}.zip.sha256`);
  sh(`aws s3 cp "${keyBase}" "${localZip}"`);
  try { sh(`aws s3 cp "${shaKey}" "${localSha}"`); } catch {}
  return { localZip, localSha };
}

function pickLatestFromGH() {
  if (!tryBin("gh")) throw new Error("gh CLI not found");
  if (!GH_REPO) throw new Error("GH_REPO required for gh mode");
  const rel = sh(`gh release list -R "${GH_REPO}" --limit 1`).trim().split("\n")[0];
  if (!rel) throw new Error("No releases found");
  const tag = rel.split(/\t/)[0];
  sh(`gh release download "${tag}" -R "${GH_REPO}" --dir "${WORK}" --pattern "backup-*.zip" --pattern "backup-*.zip.sha256"`);
  const files = sh(`ls -1 "${WORK}"`).trim().split("\n");
  const zip = files.find(f=>f.endsWith(".zip"));
  if (!zip) throw new Error("No .zip found in downloaded assets");
  const sha = files.find(f=>f.endsWith(".zip.sha256"));
  return { localZip: join(WORK, zip), localSha: sha ? join(WORK, sha) : "" };
}

function pickLatestFromLocal() {
  const glob = process.env.OFFSITE_LOCAL_GLOB || "artifacts/**/backup-*.zip tmp/backup-*/**/*.zip tmp/local/backup-*.zip";
  const zip = sh(`bash -lc 'ls -1t ${glob} 2>/dev/null | head -n1'`).trim();
  if (!zip) throw new Error("No local backup zips found via OFFSITE_LOCAL_GLOB");
  let sha = "";
  try { sha = sh(`bash -lc 'ls -1 "${zip}.sha256" 2>/dev/null || true'`).trim(); } catch {}
  return { localZip: zip, localSha: sha };
}

function sha256(file) {
  const h = createHash("sha256");
  return new Promise((resolve,reject)=>{
    createReadStream(file).on("data",d=>h.update(d)).on("end",()=>resolve(h.digest("hex"))).on("error",reject);
  });
}

function parseShaFile(p){
  if (!p || !existsSync(p)) return "";
  const txt = readFileSync(p, "utf8");
  const m = txt.match(/[a-f0-9]{64}/i);
  return m ? m[0].toLowerCase() : "";
}

async function main(){
  const t0 = Date.now();
  let localZip="", localSha="";
  if (MODE === "s3") ({localZip, localSha} = pickLatestFromS3());
  else if (MODE === "gh") ({localZip, localSha} = pickLatestFromGH());
  else if (MODE === "local") ({localZip, localSha} = pickLatestFromLocal());
  else throw new Error(`Unknown OFFSITE_MODE: ${MODE}`);
  state.zip = localZip; state.shaFile = localSha;
  state.durations.downloadMs = Date.now() - t0;

  const t1 = Date.now();
  const actual = await sha256(localZip);
  const expected = parseShaFile(localSha);
  state.actualChecksum = actual;
  state.expectedChecksum = expected || null;
  state.checksumMatch = expected ? (expected === actual) : true;
  state.durations.checksumMs = Date.now() - t1;
  if (expected && !state.checksumMatch) throw new Error("Checksum mismatch");

  const t2 = Date.now();
  const UNPACK = join(WORK, "unpacked");
  mkdirSync(UNPACK, {recursive:true});
  if (!tryBin("unzip")) throw new Error("unzip not found");
  sh(`unzip -q "${localZip}" -d "${UNPACK}"`);
  state.unpackedDir = UNPACK;
  state.durations.unzipMs = Date.now() - t2;

  const smokeCmds = [
    {name:"modelo100.map.health", cmd:`node scripts/modelo100.map.health.mjs`, cwd:process.cwd()},
    {name:"secrets.scan", cmd:`node scripts/security.secrets.scan.mjs`, cwd:process.cwd()},
  ];

  for (const s of smokeCmds) {
    const tS = Date.now();
    const r = spawnSync(s.cmd, {shell:true, cwd:s.cwd, encoding:"utf8"});
    state.smoke.push({name:s.name, status:r.status===0?"OK":"FAIL", exitCode:r.status, stdout:r.stdout?.slice(-2000)||"", stderr:r.stderr?.slice(-2000)||""});
    state.durations[`smoke.${s.name}.ms`] = Date.now() - tS;
    if (r.status !== 0) throw new Error(`Smoke failed: ${s.name}`);
  }

  state.finishedAt = new Date().toISOString();
  state.ok = true;

  writeOutputs(state);
}

function writeOutputs(s){
  const jsonPath = join(OUTDIR, "restore.report.json");
  writeFileSync(jsonPath, JSON.stringify(s,null,2));
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Restore Report</title>
<style>body{font-family:system-ui,Segoe UI,Arial;margin:24px}code,pre{background:#f6f8fa;padding:8px;border-radius:8px;display:block;overflow:auto}table{border-collapse:collapse;margin-top:12px}td,th{border:1px solid #ddd;padding:8px}th{text-align:left;background:#fafafa}</style>
</head><body>
<h1>Disaster-Recovery Restore Report</h1>
<p><b>Mode:</b> ${s.mode}</p>
<p><b>Started:</b> ${s.startedAt} · <b>Finished:</b> ${s.finishedAt}</p>
<p><b>ZIP:</b> ${basename(s.zip)}</p>
<p><b>Checksum:</b> ${s.checksumMatch ? "✔ Verified" : "✖ Mismatch"}${s.expectedChecksum ? ` · expected ${s.expectedChecksum}`:""} · actual ${s.actualChecksum}</p>
<h2>Durations</h2>
<table><thead><tr><th>Step</th><th>ms</th></tr></thead><tbody>
${Object.entries(s.durations).map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join("")}
</tbody></table>
<h2>Smoke Results</h2>
<table><thead><tr><th>Name</th><th>Status</th><th>Exit</th></tr></thead><tbody>
${s.smoke.map(r=>`<tr><td>${r.name}</td><td>${r.status}</td><td>${r.exitCode}</td></tr>`).join("")}
</tbody></table>
<h2>Tail Outputs</h2>
${s.smoke.map(r=>`<h3>${r.name}</h3><details><summary>stdout</summary><pre>${escapeHTML(r.stdout||"")}</pre></details><details><summary>stderr</summary><pre>${escapeHTML(r.stderr||"")}</pre></details>`).join("")}
</body></html>`;
  writeFileSync(join(OUTDIR, "restore.report.html"), html);
  console.log(JSON.stringify({ok:true, report: {json: jsonPath, html: join(OUTDIR,"restore.report.html")}}, null, 2));
}

function escapeHTML(s){return s.replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]))}

main().catch(err=>{
  state.ok = false;
  state.error = String(err && err.message || err);
  writeOutputs(state);
  console.error(state.error);
  process.exit(1);
});
