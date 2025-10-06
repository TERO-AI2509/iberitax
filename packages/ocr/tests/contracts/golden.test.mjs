import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const goldenRoot = path.join(__dirname, "golden")
const promoted = ["field6","field7","field8"]

async function resolveNormalizer() {
  const mod = await import("../../../dist/normalize.js").catch(async () => {
    return await import("../../../src/normalize.ts")
  })
  return mod.default || mod.normalize || mod
}

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"))
}

function computeDelta(before, after) {
  // Accept numbers or strings; coerce safely for Δ test
  const bn = typeof before === "number" ? before : Number(before)
  const an = typeof after === "number" ? after : Number(after)
  if (Number.isFinite(bn) && Number.isFinite(an)) return an - bn
  // Fallback: string equality → Δ=0 if equal, +1 if different
  return before === after ? 0 : 1
}

for (const f of promoted) {
  const dir = path.join(goldenRoot, f)
  const fixtures = fs.readdirSync(dir).filter(x => x.endsWith(".json") && !x.startsWith("expected"))
  test(`${f} — golden folder present`, () => {
    expect(fs.existsSync(dir)).toBe(true)
  })
  for (const name of fixtures) {
    const base = path.basename(name, ".json")
    const inputPath = path.join(dir, "input.ocr.json")
    const expectedPath = path.join(dir, "expected.normalized.json")
    test(`${f}/${base} matches golden`, async () => {
      expect(fs.existsSync(inputPath)).toBe(true)
      expect(fs.existsSync(expectedPath)).toBe(true)
      const input = loadJSON(inputPath)
      const expected = loadJSON(expectedPath) // { field6 | field7 | field8 : <value> }
      const normalize = await resolveNormalizer()
      const result = await normalize(input)
      const current = (result?.normalized ?? result)?.[f]
      const want = expected[f]
      expect(current).toEqual(want)
      // Δ guard: fail if Δ > 0 (tightened)
      const delta = computeDelta(want, current)
      expect(delta).toBeLessThanOrEqual(0)
    })
  }
}
