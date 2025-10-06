import fs from "fs"
import path from "path"
import sharp from "sharp"

const root = path.resolve(process.cwd(), "packages/ocr") // run from repo root OR pkg root
const looksLikePkgRoot = fs.existsSync(path.join(process.cwd(), "tests")) && fs.existsSync(path.join(process.cwd(), "package.json"))
const effectiveRoot = looksLikePkgRoot ? process.cwd() : root

const goldenRoot = path.join(effectiveRoot, "tests/contracts/golden")
const overlaysRoot = path.join(effectiveRoot, "artifacts/overlays")
fs.mkdirSync(overlaysRoot, { recursive: true })

function drawSvg(w, h, fieldBox, glyphs) {
  const rect = (x,y,w,h,stroke) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${stroke}" stroke-width="2"/>`
  const glyphRects = (glyphs||[]).map(g => rect(g.x,g.y,g.w,g.h,"#00BCD4")).join("")
  const fieldRect = rect(fieldBox.x,fieldBox.y,fieldBox.w,fieldBox.h,"#FF5252")
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${fieldRect}${glyphRects}</svg>`
}
const readJSON = p => JSON.parse(fs.readFileSync(p,"utf8"))

function firstExisting(paths){ for (const p of paths){ if (fs.existsSync(p)) return p } return null }

async function renderOne(field){
  const dir = path.join(goldenRoot, field)
  const inPath = path.join(dir, "input.ocr.json")
  if(!fs.existsSync(inPath)) return

  const regionInGolden = path.join(dir, "region.png")
  const regionInArtifacts = path.join(effectiveRoot, "artifacts/regions", field, "region.png")
  const regionPng = firstExisting([regionInGolden, regionInArtifacts])
  if(!regionPng) return

  const ocr = readJSON(inPath)
  const meta = (ocr && ocr.meta && ocr.meta.image) ? ocr.meta.image : { width: 2000, height: 2000 }
  const fieldBox = (ocr && ocr.regions && ocr.regions[field] && ocr.regions[field].bbox) ? ocr.regions[field].bbox : {x:10,y:10,w:100,h:50}
  const glyphs = (ocr && ocr.regions && ocr.regions[field] && ocr.regions[field].glyphs) ? ocr.regions[field].glyphs : []

  const svg = Buffer.from(drawSvg(meta.width, meta.height, fieldBox, glyphs))
  const outDir = path.join(overlaysRoot, field)
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, "region.overlay.png")
  await sharp(regionPng).composite([{ input: svg, top:0, left:0 }]).png().toFile(outPath)
}

async function main(){
  const fields = fs.readdirSync(goldenRoot).filter(f=>fs.statSync(path.join(goldenRoot,f)).isDirectory())
  for(const field of fields){ await renderOne(field) }
}
main()
