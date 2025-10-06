import fs from "fs"
import path from "path"
const dir = "packages/ocr/artifacts/reports/history"
const files = fs.readdirSync(dir).filter(f => f.endsWith(".html") && f !== "index.html")
for (const f of files){
  const field = f.replace(/\.html$/, "")
  const p = path.join(dir, f)
  let html = fs.readFileSync(p, "utf8")
  html = html.replace(/>Download CSV</g, `><a href="fields/${field}.csv" download>Download CSV</a><`)
  fs.writeFileSync(p, html, "utf8")
  console.log(`linked ${f} -> fields/${field}.csv`)
}
