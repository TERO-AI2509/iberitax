// path: tests/golden/golden.test.js
const Ajv = require("ajv/dist/2020"); // draft 2020-12
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const SCHEMAS_DIR = path.join(__dirname, "../../schemas");

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function schema(name) {
  return readJSON(path.join(SCHEMAS_DIR, name));
}
function sample(name) {
  return readJSON(path.join(__dirname, name));
}

describe("Golden fixtures validate against JSON Schemas", () => {
  const ajv = new Ajv({ strict: true, allErrors: true });
  addFormats(ajv);

  // ✅ Preload ALL schemas so $ref can be resolved (e.g., modelo100 from extraction_result)
  beforeAll(() => {
    const files = fs.readdirSync(SCHEMAS_DIR).filter((f) => f.endsWith(".schema.json"));
    for (const f of files) {
      const s = schema(f);
      // Ajv uses the schema's $id to resolve relative refs
      ajv.addSchema(s);
    }
  });

  it("extraction_result + companions", () => {
    const v_extraction = ajv.getSchema("https://schemas.iberitax.local/extraction_result.schema.json")
      || ajv.compile(schema("extraction_result.schema.json"));
    const v_summary = ajv.getSchema("https://schemas.iberitax.local/plain_summary.schema.json")
      || ajv.compile(schema("plain_summary.schema.json"));
    const v_tip = ajv.getSchema("https://schemas.iberitax.local/deduction_tip.schema.json")
      || ajv.compile(schema("deduction_tip.schema.json"));
    const v_progress = ajv.getSchema("https://schemas.iberitax.local/user_progress.schema.json")
      || ajv.compile(schema("user_progress.schema.json"));

    const ex = sample("extraction_result.example.json");
    const ps = sample("plain_summary.example.json");
    const tip = sample("deduction_tip.example.json");
    const prog = sample("user_progress.example.json");

    expect(v_extraction(ex)).toBe(true);
    expect(v_summary(ps)).toBe(true);
    expect(v_tip(tip)).toBe(true);
    expect(v_progress(prog)).toBe(true);
  });
});
