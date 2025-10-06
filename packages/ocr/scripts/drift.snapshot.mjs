import fs from "fs"
import path from "path"
const src = "packages/ocr/artifacts/drift/drift_amounts.csv"
if (!fs.existsSync(src)) process.exit(1)
const ts = new Date().toISOString().replace(/[:]/g,"-")
const dir = path.join("packages/ocr/artifacts/reports/history", ts)
fs.mkdirSync(dir, { recursive: true })
fs.copyFileSync(src, path.join(dir, "drift_amounts.csv"))
console.log(dir)
