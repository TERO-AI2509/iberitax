import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT = path.resolve(__dirname, "..")
const ARTIFACTS = path.join(ROOT, "artifacts")
const DRIFT_DIR = path.join(ARTIFACTS, "drift")
const REPORTS_DIR = path.join(ARTIFACTS, "reports")
const REPORT_PATH = path.join(REPORTS_DIR, "drift-dashboard.html")
const TOL_PATH = path.join(ROOT, "config", "tolerances.json")

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
}

function readCSV(p) {
  const raw = fs.readFileSync(p, "utf8").trim()
  const [head, ...rows] = raw.split(/\r?\n/)
  const cols = head.split(",").map(s => s.trim())
  return rows.filter(Boolean).map(line => {
    const parts = line.split(",").map(s => s.trim())
    const obj = {}
    cols.forEach((c, i) => (obj[c] = parts[i]))
    return obj
  })
}

function firstExisting(paths) {
  for (const p of paths) if (p && fs.existsSync(p)) return p
  return null
}

function guessOverlay(field) {
  const cand = []
  cand.push(path.join(ARTIFACTS, "overlays", `${field}.png`))
  cand.push(path.join(ARTIFACTS, "overlays", `${field}.jpg`))
  cand.push(path.join(ARTIFACTS, "regions", `${field}.overlay.png`))
  cand.push(path.join(ARTIFACTS, "regions", `${field}.png`))
  cand.push(path.join(ARTIFACTS, "regions", `${field}.jpg`))
  return firstExisting(cand)
}

function classifyVolatility(deltaAbs) {
  if (deltaAbs < 1) return "Stable"
  if (deltaAbs < 4) return "Volatile"
  return "Critical"
}

function statusColor(withinTol, volClass) {
  if (withinTol) return "var(--ok)"
  if (volClass === "Volatile") return "var(--warn)"
  return "var(--crit)"
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]))
}

export async function generateDriftDashboard() {
  ensureDir(REPORTS_DIR)

  const csvPath = path.join(DRIFT_DIR, "drift_amounts.csv")
  if (!fs.existsSync(csvPath)) {
    console.error("missing drift_amounts.csv")
    return
  }

  const rows = readCSV(csvPath)
  const tol = fs.existsSync(TOL_PATH) ? JSON.parse(fs.readFileSync(TOL_PATH, "utf8")) : {}
  const data = rows.map(r => {
    const field = r.field || r.Field || r.name || r.Name
    const deltaNum = Number(r.delta ?? r.Delta ?? r.Δ ?? 0)
    const tolVal = Number((tol[field]?.abs) ?? (tol[field]?.value) ?? tol[field] ?? 0)
    const passFail = Math.abs(deltaNum) <= tolVal
    const vol = classifyVolatility(Math.abs(deltaNum))
    const overlay = guessOverlay(field)
    return {
      field,
      delta: isFinite(deltaNum) ? deltaNum : 0,
      tolerance: isFinite(tolVal) ? tolVal : 0,
      vol,
      pass: !!passFail,
      overlayRel: overlay ? path.relative(REPORTS_DIR, overlay).split(path.sep).join("/") : null
    }
  })

  const html = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Drift Dashboard</title>
<style>
:root{--bg:#0b0c0f;--fg:#e9ecf1;--muted:#a8b0bd;--card:#131622;--ok:#208a2f;--warn:#b78a1f;--crit:#c43c3c;--chip:#1c2133}
body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu}
.wrap{max-width:1200px;margin:0 auto;padding:24px}
h1{font-size:22px;margin:0 0 16px 0}
.toolbar{display:flex;gap:12px;align-items:center;margin:12px 0 18px}
input[type="search"]{flex:1;padding:10px 12px;border-radius:10px;border:1px solid #2a2f43;background:#0f1322;color:var(--fg)}
select{padding:10px 12px;border-radius:10px;border:1px solid #2a2f43;background:#0f1322;color:var(--fg)}
.table{width:100%;border-collapse:separate;border-spacing:0 10px}
th,td{text-align:left;padding:12px}
th{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);cursor:pointer}
.row{background:var(--card);border-radius:12px;overflow:hidden}
.status{display:inline-block;padding:4px 10px;border-radius:999px;background:var(--chip);color:var(--fg);font-weight:600}
.delta{font-variant-numeric:tabular-nums}
.imgbox{width:140px;height:88px;display:flex;align-items:center;justify-content:center;background:#0e1220;border:1px solid #22273a;border-radius:8px;overflow:hidden}
.imgbox img{max-width:100%;max-height:100%;display:block}
.small{color:var(--muted);font-size:12px}
.badge{display:inline-block;margin-left:8px;padding:2px 8px;border-radius:999px;background:#0e1220;border:1px solid #2a2f43;color:var(--muted);font-size:12px}
footer{margin-top:18px;color:var(--muted);font-size:12px}
</style>
<div class="wrap">
  <h1>Drift Dashboard</h1>
  <div class="toolbar">
    <input id="q" type="search" placeholder="Filter by field or status">
    <select id="vol">
      <option value="">All classes</option>
      <option>Stable</option>
      <option>Volatile</option>
      <option>Critical</option>
    </select>
    <select id="pass">
      <option value="">All results</option>
      <option value="pass">Pass</option>
      <option value="fail">Fail</option>
    </select>
  </div>
  <table class="table" id="tbl">
    <thead>
      <tr>
        <th data-k="field">Field</th>
        <th data-k="delta">Δ</th>
        <th data-k="tolerance">Tolerance</th>
        <th data-k="vol">Class</th>
        <th data-k="pass">Result</th>
        <th>Overlay</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
  <footer>Generated ${new Date().toISOString()}</footer>
</div>
<script>
const data = ${JSON.stringify([])}
</script>
</html>`
  const withData = html.replace("const data = []", "const data = " + JSON.stringify(data))
  fs.writeFileSync(REPORT_PATH, withData, "utf8")
  console.log("wrote", REPORT_PATH)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateDriftDashboard()
}
