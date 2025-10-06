import fs from "fs"
import path from "path"
const trendsCsv = "packages/ocr/artifacts/reports/drift_trends.csv"
const fieldsDir = "packages/ocr/artifacts/reports/history/fields"
const outHtml = "packages/ocr/artifacts/reports/drift-trends.html"
function readCsv(p){
  const raw = fs.readFileSync(p,"utf8").trim().split(/\r?\n/)
  const header = raw[0].split(",").map(s=>s.trim())
  const rows = raw.slice(1).map(line=>{
    const cols = line.split(",").map(s=>s.trim())
    const obj = {}
    header.forEach((h,i)=>obj[h]=cols[i])
    return obj
  })
  return rows
}
function spark(values){
  const w = 120, h = 32, pad = 4
  if (values.length===0) return ""
  const min = Math.min(...values), max = Math.max(...values)
  const span = max-min || 1
  const step = values.length>1 ? (w-2*pad)/(values.length-1) : 0
  const pts = values.map((v,i)=>{
    const x = pad + i*step
    const y = h - pad - ((v-min)/span)*(h-2*pad)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }).join(" ")
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="1" points="${pts}"/></svg>`
}
const trends = readCsv(trendsCsv)
let rowsHtml = ""
for (const t of trends){
  const name = t.field
  const perFieldPath = path.join(fieldsDir, `${name}.csv`)
  let values = []
  if (fs.existsSync(perFieldPath)){
    const lines = fs.readFileSync(perFieldPath,"utf8").trim().split(/\r?\n/).slice(1)
    values = lines.map(l=>parseFloat(l.split(",")[1])).filter(v=>!Number.isNaN(v))
  }
  const icon = t.trend_class==="Improving"?"▲":t.trend_class==="Worsening"?"▼":"■"
  const trendCell = `${icon} ${t.trend_class}`
  const sparkSvg = spark(values)
  rowsHtml += `<tr><td class="field">${name}</td><td class="spark">${sparkSvg}</td><td class="last">${t.last_delta}</td><td class="avg">${t.avg_delta}</td><td class="slope">${t.slope_per_run}</td><td class="class ${t.trend_class.toLowerCase()}">${trendCell}</td></tr>`
}
const cssLink = `<link rel="stylesheet" href="styles.css">`
const html = `<!doctype html><html><head><meta charset="utf-8"><title>OCR Drift — Trends</title>${cssLink}<style>table{border-collapse:collapse;width:100%}td,th{padding:.5rem;border-bottom:1px solid #ddd;font-family:ui-sans-serif,system-ui,Arial}td.spark{color:#222}td.class.improving{color:#0a7}td.class.worsening{color:#c33}td.class.stable{color:#555}thead th{text-align:left}</style></head><body><main><h1>OCR Drift — Trends</h1><table><thead><tr><th>Field</th><th>Trend</th><th>Last Δ</th><th>Avg Δ</th><th>Slope/run</th><th>Class</th></tr></thead><tbody>${rowsHtml}</tbody></table></main></body></html>`
fs.writeFileSync(outHtml, html, "utf8")
console.log(`wrote ${outHtml}`)
