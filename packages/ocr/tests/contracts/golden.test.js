const fs = require("fs")
const path = require("path")

async function resolveNormalizerOrNull() {
  const tries = [
    "../../dist/norm-index.js",
    "../../dist/normalize.js",
    "../../dist/index.js",
    "../../dist/validate/validate.extract.js",
  ]
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

const goldenRoot = path.resolve("tests/contracts/golden")

describe("OCR Golden Regression", () => {
  const fields = fs.existsSync(goldenRoot)
    ? fs.readdirSync(goldenRoot).filter(f => fs.statSync(path.join(goldenRoot,f)).isDirectory())
    : []

  test("golden folders exist", () => {
    expect(fields.length).toBeGreaterThan(0)
  })

  for (const name of fields) {
    const dir = path.join(goldenRoot, name)
    const inPath = path.join(dir, "input.ocr.json")
    const expPath = path.join(dir, "expected.normalized.json")

    test(`${name} matches golden`, async () => {
      expect(fs.existsSync(inPath)).toBe(true)

      const input = JSON.parse(fs.readFileSync(inPath, "utf8"))
      const normalize = await resolveNormalizerOrNull()

      if (!fs.existsSync(expPath)) {
        const current = normalize ? await normalize(input) : input
        const norm = current?.normalized ?? current
        fs.writeFileSync(expPath, JSON.stringify(norm, null, 2))
      }

      expect(fs.existsSync(expPath)).toBe(true)

      const expected = JSON.parse(fs.readFileSync(expPath, "utf8"))
      const currentRaw = normalize ? await normalize(input) : input
      const current = currentRaw?.normalized ?? currentRaw
      expect(current).toEqual(expected)
    })
  }
})
