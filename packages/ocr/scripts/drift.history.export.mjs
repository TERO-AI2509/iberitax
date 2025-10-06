import fs from "fs"
import path from "path"
const root = "packages/ocr/artifacts/reports/history"
const outDir = path.join(root, "fields")
const N = parseInt(process.env.TREND_N || process.argv[2] || "5", 10)
if (!fs.existsSync(root)) process.exit(1)
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
const dirs = fs.readdirSync(root).map(name => {
  const p = path.join(root, name)
  const stat = fs.statSync(p)
  return stat.isDirectory() ? { name, mtime: stat.mtimeMs, p } : null
}).filter(Boolean).sort((a,b)=>a.mtime-b.mtime)
const recent = dirs.slice(-N)
const perField = new Map()
for (const d of recent) {
  const csvPath = path.join(d.p, "drift_amounts.csv")
  if (!fs.existsSync(csvPath)) continue
  const raw = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/)
  if (raw.length === 0) continue
  const header = raw[0].split(",").map(s=>s.trim())
  const rows = raw.slice(1).map(line=>line.split(",").map(s=>s.trim()))
  const fieldIdx = header.findIndex(h=>/^(field|name)$/i.test(h))
  const numericIdxCandidates = header.map((h,i)=>({h,i})).filter(x=>x.i!==fieldIdx)
  let valIdx = numericIdxCandidates.find(x=>/^delta$/i.test(x.h))?.i
  if (valIdx==null) valIdx = numericIdxCandidates.find(x=>/^(Δ|drift|value|last_delta)$/i.test(x.h))?.i
  if (valIdx==null) {
    const sample = rows[0]||[]
    const nums = numericIdxCandidates.filter(x=>!isNaN(parseFloat(sample[x.i]||"")))
    valIdx = (nums.at(-1)||{}).i
  }
  if (fieldIdx<0 || valIdx==null) continue
  const ts = d.name
  for (const r of rows) {
    const f = r[fieldIdx]
    const v = parseFloat(r[valIdx])
    if (!f || Number.isNaN(v)) continue
    if (!perField.has(f)) perField.set(f, [])
    perField.get(f).push({ label: f, value: v, timestamp: ts })
  }
}
for (const [field, arr] of perField) {
  arr.sort((a,b)=>a.timestamp.localeCompare(b.timestamp))
  const csv = ["label,value,timestamp", ...arr.map(x=>`${field},${x.value},${x.timestamp}`)].join("\n")
  fs.writeFileSync(path.join(outDir, `${field}.csv`), csv, "utf8")
}
console.log(`exported=${perField.size}`)
