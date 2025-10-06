import fs from "fs"
import path from "path"
import { JSDOM } from "jsdom"
const root = path.resolve("packages/ocr")
const reportsDir = path.join(root, "artifacts/reports")
const histDir = path.join(reportsDir, "history")
const dashPath = path.join(reportsDir, "drift-dashboard.html")
const html = fs.readFileSync(dashPath, "utf8")
const dom = new JSDOM(html)
const doc = dom.window.document
const cells = Array.from(doc.querySelectorAll("td"))
for (const td of cells) {
  const t = td.textContent || ""
  const p = path.join(histDir, `${t}.html`)
  if (t && fs.existsSync(p) && !td.querySelector("a")) {
    const a = doc.createElement("a")
    a.href = `history/${t}.html`
    a.textContent = t
    td.textContent = ""
    td.appendChild(a)
  }
}
fs.writeFileSync(dashPath, dom.serialize(), "utf8")
