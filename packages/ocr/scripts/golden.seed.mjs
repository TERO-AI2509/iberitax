import fs from "fs"
import path from "path"

const repo = process.cwd()
const goldenRoot = path.join(repo, "packages/ocr/tests/contracts/golden")
const samplesRoot = path.join(repo, "packages/ocr/tests/contracts/samples")
if (!fs.existsSync(goldenRoot)) fs.mkdirSync(goldenRoot, { recursive: true })

const sampleDirs = fs.readdirSync(samplesRoot).map(n=>path.join(samplesRoot,n)).filter(p=>fs.statSync(p).isDirectory())
const seedIns = sampleDirs.map(d=>path.join(d,"input.ocr.json")).filter(p=>fs.existsSync(p))
if (!seedIns.length) { console.error("No sample input.ocr.json found"); process.exit(1) }
const seedIn = seedIns[0]

const mod = await import(path.join(repo,"packages/ocr/dist/validate/validate.extract.js"))
const validateExtract = mod.validateExtract || mod.default || mod

for (const name of ["field6","field7","field8"]) {
  const dir = path.join(goldenRoot, name)
  fs.mkdirSync(dir, { recursive: true })
  fs.copyFileSync(seedIn, path.join(dir, "input.ocr.json"))
  const input = JSON.parse(fs.readFileSync(path.join(dir,"input.ocr.json"),"utf8"))
  const res = await validateExtract(input)
  const norm = res?.normalized ?? res
  fs.writeFileSync(path.join(dir,"expected.normalized.json"), JSON.stringify(norm, null, 2))
  console.log("Seeded", name)
}
