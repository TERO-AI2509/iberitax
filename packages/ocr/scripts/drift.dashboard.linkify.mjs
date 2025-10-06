import fs from "node:fs"
import path from "node:path"
import url from "node:url"

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const REPORTS = path.join(ROOT, "artifacts","reports")
const DASH = path.join(REPORTS, "drift-dashboard.html")
const HIST = path.join(REPORTS, "history")

if(!fs.existsSync(DASH) || !fs.existsSync(HIST)) process.exit(0)
let html = fs.readFileSync(DASH,"utf8")
html = html.replace(/(<td[^>]*data-field=")([^"]+)("[^>]*>)([\s\S]*?)(<\/td>)/g,(m,a,field,c,inner,e)=>{
  const href = `history/${field}.html`
  if(inner.includes("<a")) return m
  return `${a}${field}${c}<a href="${href}" style="text-decoration:none">${inner}</a>${e}`
})
fs.writeFileSync(DASH, html, "utf8")
console.log("[dashboard] linkified fields → history/*.html")
