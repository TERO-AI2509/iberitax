import fs from "fs"
import path from "path"
const root = path.resolve("packages/ocr")
const driftDir = path.join(root, "artifacts/drift")
const historyMd = path.join(driftDir, "validation_history.md")
const reportsDir = path.join(root, "artifacts/reports")
const histDir = path.join(reportsDir, "history")
if (!fs.existsSync(histDir)) fs.mkdirSync(histDir, { recursive: true })
const md = fs.readFileSync(historyMd, "utf8")
const lines = md.split(/\r?\n/)
const rows = []
for (const line of lines) {
  const m = line.match(/^\|\s*(?<run>[^|]+)\|\s*(?<field>[^|]+)\|\s*(?<delta>[-+]?\d+(\.\d+)?)\s*\|/i)
  if (m) rows.push({ run: m.groups.run.trim(), field: m.groups.field.trim(), delta: Number(m.groups.delta) })
}
const byField = new Map()
for (const r of rows) {
  if (!byField.has(r.field)) byField.set(r.field, [])
  byField.get(r.field).push({ run: r.run, delta: r.delta })
}
function sparkline(points, w = 240, h = 48, pad = 6) {
  if (points.length === 0) return ""
  const xs = points.map((_, i) => i)
  const ys = points.map(p => p.delta)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const rangeY = maxY - minY || 1
  const minX = 0
  const maxX = xs.length - 1 || 1
  const rangeX = maxX - minX || 1
  const fx = x => pad + ((x - minX) / rangeX) * (w - 2 * pad)
  const fy = y => h - pad - ((y - minY) / rangeY) * (h - 2 * pad)
  const pts = points.map((p, i) => `${fx(i)},${fy(p.delta)}`).join(" ")
  const zeroY = fy(0)
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><line x1="${pad}" y1="${zeroY}" x2="${w-pad}" y2="${zeroY}" stroke="currentColor" stroke-opacity="0.25"/><polyline fill="none" stroke="currentColor" stroke-width="2" points="${pts}"/></svg>`
}
function page(field, series) {
  const spark = sparkline(series)
  const rows = series.map(s => `<tr><td>${s.run}</td><td>${s.delta}</td></tr>`).join("")
  return `<!doctype html><meta charset="utf-8"><title>${field} · Drift History</title><link rel="stylesheet" href="../styles.css"><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:960px;margin:24px auto;padding:16px"><a href="../drift-dashboard.html">← Back to Dashboard</a><h1 style="margin:8px 0">${field} · Drift History</h1><div style="margin:12px 0">${spark}</div><table border="1" cellspacing="0" cellpadding="6"><thead><tr><th>Run</th><th>Δ</th></tr></thead><tbody>${rows}</tbody></table></body>`
}
for (const [field, series] of byField.entries()) {
  const out = path.join(histDir, `${field}.html`)
  const html = page(field, series)
  fs.writeFileSync(out, html, "utf8")
}
const index = Array.from(byField.keys()).sort().map(f => `<li><a href="./${f}.html">${f}</a></li>`).join("")
fs.writeFileSync(path.join(histDir, "index.html"), `<!doctype html><meta charset="utf-8"><title>Drift History Index</title><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:960px;margin:24px auto;padding:16px"><a href="../drift-dashboard.html">← Back to Dashboard</a><h1>Field History</h1><ul>${index}</ul></body>`, "utf8")
