import fs from "fs"
import path from "path"
const fieldsDir = "packages/ocr/artifacts/reports/history/fields"
const outCsv = "packages/ocr/artifacts/reports/drift_trends.csv"
const eps = parseFloat(process.env.TREND_EPS || "0.1")
if (!fs.existsSync(fieldsDir)) process.exit(1)
const files = fs.readdirSync(fieldsDir).filter(f=>f.endsWith(".csv"))
const lines = ["field,last_delta,avg_delta,slope_per_run,trend_class,N"]
function slopeOf(values){
  const n = values.length
  if (n<2) return 0
  const xs = [...Array(n).keys()]
  const mean = a => a.reduce((s,x)=>s+x,0)/a.length
  const mx = mean(xs), my = mean(values)
  let num=0, den=0
  for (let i=0;i<n;i++){ num += (xs[i]-mx)*(values[i]-my); den += (xs[i]-mx)*(xs[i]-mx) }
  return den===0?0:num/den
}
function classify(s){
  if (s > eps) return "Worsening"
  if (s < -eps) return "Improving"
  return "Stable"
}
for (const f of files){
  const raw = fs.readFileSync(path.join(fieldsDir,f),"utf8").trim().split(/\r?\n/)
  const rows = raw.slice(1).map(line=>line.split(","))
  const vals = rows.map(r=>parseFloat(r[1])).filter(v=>!Number.isNaN(v))
  if (vals.length===0) continue
  const last = vals[vals.length-1]
  const avg = vals.reduce((s,x)=>s+x,0)/vals.length
  const s = slopeOf(vals)
  const cls = classify(s)
  const name = f.replace(/\.csv$/,"")
  lines.push([name,last.toFixed(4),avg.toFixed(4),s.toFixed(6),cls,vals.length].join(","))
}
fs.writeFileSync(outCsv, lines.join("\n"), "utf8")
console.log(`wrote ${outCsv}`)
