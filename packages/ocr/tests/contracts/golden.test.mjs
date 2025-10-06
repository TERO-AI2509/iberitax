import fs from "fs"
import path from "path"
import { validateExtract } from "../../dist/validate/validate.extract.js"

const goldenRoot = path.resolve("packages/ocr/tests/contracts/golden")
const fields = fs.readdirSync(goldenRoot).filter(f=>f.startsWith("field"))

describe("OCR Golden Regression", () => {
  for (const fld of fields) {
    const dir = path.join(goldenRoot, fld)
    const input = JSON.parse(fs.readFileSync(path.join(dir,"input.ocr.json"),"utf8"))
    const expected = JSON.parse(fs.readFileSync(path.join(dir,"expected.normalized.json"),"utf8"))
    test(`${fld} matches golden`, async () => {
      const result = await validateExtract(input)
      const current = result.normalized || result
      expect(current).toEqual(expected)
    })
  }
})
