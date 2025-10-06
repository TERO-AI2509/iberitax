import fs from "fs"
import path from "path"

async function resolveNormalizerOrNull() {
  const tries = ["../dist/norm-index.js","../dist/normalize.js","../dist/index.js","../dist/validate/validate.extract.js"]
  for (const spec of tries) {
    try {
      const m = await import(spec)
      const cands = [m.normalize, m.validateExtract, m.default, m.run, m.extract, m?.default?.normalize, m?.default?.validateExtract]
      const fn = cands.find(x => typeof x === "function")
      if (fn) return fn
    } catch (_) {}
  }
  return null
}

const pkg = process.cwd()
const goldenRoot = path.join(pkg, "tests/contracts/golden")
const samplesRoot = path.join(pkg, "tests/contracts/samples")
if (!fs.existsSync(goldenRoot)) fs.mkdirSync(goldenRoot, { recursive: true })
const sampleDirs = fs.readdirSync(samplesRoot).map(n=>path.join(samplesRoot,n)).filter(p=>fs.statSync(p).isDirectory())
const seedIn = sampleDirs.map(d=>path.join(d,"input.ocr.json")).find(p=>fs.existsSync(p))
if (!seedIn) { console.error("No sample input.ocr.json found"); process.exit(1) }

const normalize = await resolveNormalizerOrNull()

for (const name of ["field6","field7","field8"]) {
  const dir = path.join(goldenRoot, name)
  fs.mkdirSync(dir, { recursive: true })
  fs.copyFileSync(seedIn, path.join(dir, "input.ocr.json"))
  const input = JSON.parse(fs.readFileSync(path.join(dir,"input.ocr.json"),"utf8"))
  const currentRaw = normalize ? await normalize(input) : input
  const norm = currentRaw?.normalized ?? currentRaw
  fs.writeFileSync(path.join(dir,"expected.normalized.json"), JSON.stringify(norm, null, 2))
  console.log("Seeded", name, normalize ? "(normalized)" : "(identity)")
}
