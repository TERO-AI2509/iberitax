import fs from "fs"
import path from "path"
import sharp from "sharp"

const ROOT = process.cwd()
const promoted = ["field6","field7","field8"]

function loadJSON(p){ return JSON.parse(fs.readFileSync(p,"utf8")) }

async function run() {
  const ts = new Date().toISOString().replace(/[:.]/g,"-")
  const outRoot = path.join(ROOT, "packages/ocr/artifacts/regions", ts)
  fs.mkdirSync(outRoot, { recursive: true })

  for (const f of promoted) {
    const goldenDir = path.join(ROOT, "packages/ocr/tests/contracts/golden", f)
    if (!fs.existsSync(goldenDir)) continue
    const inputPath = path.join(goldenDir, "input.ocr.json")
    if (!fs.existsSync(inputPath)) continue
    const input = loadJSON(inputPath)

    // Expecting input.ocr.source.path and input.ocr.fields[f].bbox = [x,y,w,h]
    const imgPath = input?.ocr?.source?.path
    const bbox = input?.ocr?.fields?.[f]?.bbox
    if (!imgPath || !bbox) continue

    const [x,y,w,h] = bbox.map(n=>Number(n)||0)
    const outDirField = path.join(outRoot, f)
    fs.mkdirSync(outDirField, { recursive: true })

    const outFieldPng = path.join(outDirField, "region.png")
    await sharp(imgPath).extract({ left:x, top:y, width:w, height:h }).toFile(outFieldPng)

    const goldenFieldPng = path.join(goldenDir, "region.png")
    fs.copyFileSync(outFieldPng, goldenFieldPng)
  }

  console.log("Region snapshots updated under", outRoot)
}
run().catch(e => { console.error(e); process.exit(1) })
