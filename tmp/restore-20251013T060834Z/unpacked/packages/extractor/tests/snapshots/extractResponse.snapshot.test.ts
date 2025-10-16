import fs from "node:fs";
import path from "node:path";
import { validateExtractResponse } from "../../src/validateExtractResponse";

// Read JSON helper
const readJson = (p: string) => JSON.parse(fs.readFileSync(p, "utf8"));

// Pick only stable fields from Ajv errors for snapshotting
function normalizeAjvErrors(errs: any[] | null | undefined) {
  if (!Array.isArray(errs)) return [];
  return errs.map(e => ({
    instancePath: e.instancePath ?? "",
    keyword: e.keyword ?? "",
    message: e.message ?? "",
    // include a few stable params if present (omit noisy ones)
    params: e.params && typeof e.params === "object"
      ? Object.fromEntries(
          Object.entries(e.params).filter(([k]) =>
            ["missingProperty", "allowedValues", "type", "limit", "additionalProperty"].includes(k)
          )
        )
      : undefined,
    schemaPath: e.schemaPath ?? ""
  }));
}

describe("Extractor schema snapshots", () => {
  const base = path.join(__dirname, "..", "fixtures", "extract");
  const valid = readJson(path.join(base, "valid.json"));
  const invalid = readJson(path.join(base, "invalid.json"));

  it("valid payload still validates (true)", () => {
    const ok = validateExtractResponse(valid);
    const errs = (validateExtractResponse as any).errors;
    expect(ok).toBe(true);
    expect(errs == null || errs.length === 0).toBe(true);
  });

  it("invalid payload produces the same normalized Ajv errors (snapshot)", () => {
    const ok = validateExtractResponse(invalid as unknown);
    const errs = (validateExtractResponse as any).errors;
    expect(ok).toBe(false);
    const normalized = normalizeAjvErrors(errs);
    expect(normalized).toMatchSnapshot();
  });
});
