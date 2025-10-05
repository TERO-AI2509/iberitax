import fs from "node:fs";
import path from "node:path";

const PKG_ROOT = process.cwd();
const ART_DIR = path.join(PKG_ROOT, "artifacts", "drift");
const CSV_PATH = path.join(ART_DIR, "drift_amounts.csv");
const HIST_MD = path.join(PKG_ROOT, "artifacts", "validation_history.md");
const OUT_HTML = path.join(ART_DIR, "index.html");

function readCSV(p) {
  const t = fs.readFileSync(p, "utf8").trim();
  if (!t) return [];
  const [h, ...rows] = t.split(/\r?\n/);
  const header = h.split(",").map(s=>s.trim());
  return rows.map(line=>{
    const cells = line.split(",").map(s=>s.trim());
    const row = Object.fromEntries(header.map((k,i)=>[k, cells[i]]));
    return {
      field: row.field || row.Field || row.name || row.KEY || "",
      prev: Number(row.prev ?? row.Prev ?? row.previous ?? row.before ?? "NaN"),
      last: Number(row.last ?? row.Last ?? row.current ?? row.after ?? "NaN"),
      delta: Number(row.delta ?? row["Δ"] ?? row.diff ?? row.change ?? "NaN"),
      support: row.support ? Number(row.support) : (row.Support ? Number(row.Support) : null),
    };
  });
}

const rows = fs.existsSync(CSV_PATH) ? readCSV(CSV_PATH) : [];
const linkHistory = fs.existsSync(HIST_MD) ? "validation_history.md" : null;

const styles = `
body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:24px}
h1{margin:0 0 8px}
.small{color:#666;font-size:12px}
table{border-collapse:collapse;width:100%;margin-top:12px}
th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
th{background:#f8fafc}
.badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;border:1px solid #e5e7eb}
.ok{background:#ecfdf5}
.warn{background:#fff7ed}
.fail{background:#fef2f2}
.spark{display:inline-block;height:24px;width:120px;vertical-align:middle}
footer{margin-top:24px;color:#666;font-size:12px}
`;

const rowsHtml = rows.map(r=>{
  const cls = Number.isFinite(r.delta)
    ? (r.delta < -2 ? "fail" : (r.delta < 0 ? "warn" : "ok"))
    : "";
  return `<tr>
    <td>${r.field}</td>
    <td>${Number.isFinite(r.prev)?r.prev.toFixed(2):""}</td>
    <td>${Number.isFinite(r.last)?r.last.toFixed(2):""}</td>
    <td><span class="badge ${cls}">${Number.isFinite(r.delta)?r.delta.toFixed(2):""}</span></td>
    <td>${Number.isFinite(r.support)?r.support:""}</td>
    <td><canvas class="spark" data-field="${r.field}"></canvas></td>
  </tr>`;
}).join("\n");

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>OCR Drift Dashboard</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>${styles}</style>
</head>
<body>
<h1>OCR Drift Dashboard</h1>
<div class="small">Generated ${new Date().toISOString()}</div>
${linkHistory ? `<div class="small"><a href="../validation_history.md">Open validation history</a></div>` : ""}

<table>
  <thead>
    <tr>
      <th>Field</th><th>Prev</th><th>Last</th><th>Δ</th><th>Support</th><th>Trend</th>
    </tr>
  </thead>
  <tbody>
    ${rowsHtml}
  </tbody>
</table>

<footer>Δ classes: ok ≥ 0 · warn &lt; 0 · fail ≤ -2 (global threshold)</footer>

<script>
(async function(){
  const histUrl = ${linkHistory ? "`../validation_history.md`" : "null"};
  const trends = {};
  if(histUrl){
    try{
      const md = await fetch(histUrl).then(r=>r.text());
      const lines = md.split(/\\r?\\n/);
      // naive parse: lines like "field_x: 88,89,90"
      for(const ln of lines){
        const m = ln.match(/^\\s*([\\w.-]+)\\s*:\\s*([0-9.,\\s-]+)$/);
        if(m){ trends[m[1]] = m[2].split(/,\\s*/).map(Number).filter(n=>Number.isFinite(n)).slice(-20); }
      }
    } catch {}
  }
  document.querySelectorAll("canvas.spark").forEach(cv=>{
    const f = cv.dataset.field;
    const series = trends[f] || [];
    const ctx = cv.getContext("2d");
    const w = cv.width = cv.clientWidth;
    const h = cv.height = cv.clientHeight;
    if(!series.length){ ctx.fillStyle="#e5e7eb"; ctx.fillRect(0,h-2,w,2); return; }
    const min = Math.min(...series), max = Math.max(...series);
    const nx = series.length-1 || 1;
    ctx.beginPath();
    series.forEach((v,i)=>{
      const x = i* (w/nx);
      const y = h - ( (v - min) / (max - min || 1) ) * (h-4) - 2;
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#111827";
    ctx.stroke();
  });
})();
</script>
</body>
</html>`;
fs.writeFileSync(OUT_HTML, html);
console.log("Wrote " + OUT_HTML);
