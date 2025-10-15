import fs from "node:fs";
import path from "node:path";
import { validateExtractResponse } from "../../src/validateExtractResponse";

const readJson = (p: string) => JSON.parse(fs.readFileSync(p, "utf8"));

describe("Golden schema evolution guard", () => {
  const base = path.join(__dirname);
  const valid = readJson(path.join(base, "valid.json"));
  const invalid = readJson(path.join(base, "invalid.json"));

  it("valid.json still validates (true)", () => {
    const ok = validateExtractResponse(valid);
    const errs = (validateExtractResponse as any).errors;
    expect(ok).toBe(true);
    expect(errs == null || errs.length === 0).toBe(true);
  });

  it("invalid.json still fails (false)", () => {
    const ok = validateExtractResponse(invalid as unknown);
    const errs = (validateExtractResponse as any).errors;
    expect(ok).toBe(false);
    expect(Array.isArray(errs) && errs.length > 0).toBe(true);
  });
});
