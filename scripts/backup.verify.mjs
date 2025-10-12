import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const OUTDIR = 'artifacts/backups';
const LIMIT = Number(process.env.LIMIT || 3);
const REQUIRED = [
  'RUNBOOK.md',
  'docs/',
  'artifacts/modelo100/',
  'repo-manifest.txt',
  'rules' 
];

function sha256(path) {
  const h = createHash('sha256');
  const buf = readFileSync(path);
  h.update(buf);
  return h.digest('hex');
}

function listBackups(dir) {
  const files = readdirSync(dir).filter(f => f.startsWith('backup-') && f.endsWith('.zip'));
  files.sort((a,b) => {
    const sa = statSync(join(dir,a)).mtimeMs;
    const sb = statSync(join(dir,b)).mtimeMs;
    return sb - sa;
  });
  return files.slice(0, LIMIT);
}

function unzipList(path) {
  try {
    const out = execFileSync('unzip', ['-Z1', path], { encoding: 'utf8' });
    return out.split('\n').filter(Boolean);
  } catch (e) {
    return [];
  }
}

function hasPath(entries, req) {
  if (req.endsWith('/')) return entries.some(x => x.startsWith(req));
  if (req.endsWith('*')) return entries.some(x => x.startsWith(req.slice(0,-1)));
  if (req.includes('.')) return entries.some(x => x === req || x.startsWith(req));
  return entries.some(x => x.startsWith(req));
}

function main() {
  const zips = listBackups(OUTDIR);
  const rows = [];
  let allOk = true;

  for (const z of zips) {
    const zipPath = join(OUTDIR, z);
    const shaPath = `${zipPath}.sha256`;
    const metaPath = `${zipPath}.meta.json`;

    const computed = sha256(zipPath);
    let recorded = null;
    try {
      const first = readFileSync(shaPath, 'utf8').trim().split(/\s+/)[0];
      recorded = first || null;
    } catch {}
    const shaOk = Boolean(recorded) && recorded === computed;

    const entries = unzipList(zipPath);
    const missing = REQUIRED.filter(req => !hasPath(entries, req));

    const size = statSync(zipPath).size;
    const ts = statSync(zipPath).mtime.toISOString();

    const row = { zip: z, size, ts, shaOk, recorded, computed, missing, count: entries.length, metaPath };
    rows.push(row);
    if (!shaOk || missing.length > 0) allOk = false;
  }

  const report = { ok: allOk, checked: rows.length, dir: OUTDIR, required: REQUIRED, rows };
  const jsonOut = join(OUTDIR, 'verify.json');
  const htmlOut = join(OUTDIR, 'verify.html');

  writeFileSync(jsonOut, JSON.stringify(report, null, 2));

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Backups Verify</title>
<style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:16px}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px}th{background:#f5f5f5;text-align:left}
.bad{color:#b00020;font-weight:600}.ok{color:#0a7a2a;font-weight:600}.mono{font-family:ui-monospace,Menlo,Monaco,monospace}
</style></head>
<body>
<h1>Backups Verify</h1>
<p><b>Status:</b> ${allOk ? '<span class="ok">OK</span>' : '<span class="bad">FAIL</span>'}</p>
<p>Directory: <span class="mono">${OUTDIR}</span> • Required: <span class="mono">${REQUIRED.join(', ')}</span></p>
<table><thead><tr><th>Zip</th><th>Timestamp</th><th>Size</th><th>Entries</th><th>SHA256</th><th>Missing</th></tr></thead><tbody>
${rows.map(r=>`<tr>
<td class="mono">${r.zip}</td>
<td>${r.ts}</td>
<td>${r.size}</td>
<td>${r.count}</td>
<td>${r.shaOk ? '<span class="ok">OK</span>' : '<span class="bad">MISMATCH</span>'}</td>
<td>${r.missing.length?'<span class="bad">'+r.missing.join(', ')+'</span>':'<span class="ok">None</span>'}</td>
</tr>`).join('')}
</tbody></table>
</body></html>`;
  writeFileSync(htmlOut, html);

  console.log(JSON.stringify({ ok: allOk, json: jsonOut, html: htmlOut, checked: rows.length }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
