const Ajv = require("ajv/dist/2020");
const addFormats = require("ajv-formats");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const SCHEMAS_DIR = path.join(ROOT, "schemas");

async function http(base, p, init) {
  const r = await fetch(new URL(p, base), {
    ...init,
    headers: { "content-type": "application/json", ...(init && init.headers) }
  });
  const body = await r.json();
  return { status: r.status, body };
}
function readJSON(p) { return JSON.parse(fs.readFileSync(p, "utf8")); }

describe("Stub server contracts (Ajv + Zod)", () => {
  let server;
  let base;

  const ajv = new Ajv({ strict: true, allErrors: true });
  addFormats(ajv);
  for (const f of fs.readdirSync(SCHEMAS_DIR).filter((x) => x.endsWith(".schema.json"))) {
    ajv.addSchema(readJSON(path.join(SCHEMAS_DIR, f)));
  }

  const z = require("zod");
  const { jsonSchemaToZod } = require("json-schema-to-zod");
  function zodFromSchema(name) {
    const obj = readJSON(path.join(SCHEMAS_DIR, name));
    const expr = jsonSchemaToZod(obj);
    return eval("(function(z){ return " + expr + "; })(z)");
  }
  const Z = {
    ExtractionResult: zodFromSchema("extraction_result.schema.json"),
    PlainSummary: zodFromSchema("plain_summary.schema.json"),
    DeductionTip: zodFromSchema("deduction_tip.schema.json"),
    UserProgress: zodFromSchema("user_progress.schema.json"),
    Modelo100: zodFromSchema("modelo100.schema.json")
  };

  beforeAll(async () => {
    const mod = await import(path.join(ROOT, "apps/stub-server/src/server.mjs"));
    server = mod.buildServer();
    const address = await server.listen({ port: 0, host: "127.0.0.1" });
    base = address.endsWith("/") ? address : address + "/";
  });

  afterAll(async () => {
    if (server) await server.close();
  });

  test("GET /health", async () => {
    const { status, body } = await http(base, "health");
    expect(status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  test("POST /extractions and GET /extractions/{id}", async () => {
    const post = await http(base, "extractions", {
      method: "POST",
      body: JSON.stringify({
        sources: [{ filename: "payslip.pdf", mimeType: "application/pdf", bytesBase64: "AAA=" }]
      })
    });
    expect(post.status).toBe(202);
    expect(post.body).toEqual({ jobId: "job_123" });

    const get = await http(base, "extractions/" + post.body.jobId, { method: "GET" });
    expect(get.status).toBe(200);

    const v = ajv.getSchema("https://schemas.iberitax.local/extraction_result.schema.json");
    expect(v(get.body)).toBe(true);

    const parsed = Z.ExtractionResult.parse(get.body);
    expect(parsed).toEqual(get.body);
  });

  test("POST /summaries/plain", async () => {
    const res = await http(base, "summaries/plain", {
      method: "POST",
      body: JSON.stringify({ fake: true })
    });
    expect(res.status).toBe(200);
    const v = ajv.getSchema("https://schemas.iberitax.local/plain_summary.schema.json");
    expect(v(res.body)).toBe(true);
    const parsed = Z.PlainSummary.parse(res.body);
    expect(parsed).toEqual(res.body);
  });

  test("POST /tips/deductions", async () => {
    const res = await http(base, "tips/deductions", {
      method: "POST",
      body: JSON.stringify({ fake: true })
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const v = ajv.getSchema("https://schemas.iberitax.local/deduction_tip.schema.json");
    expect(v(res.body[0])).toBe(true);
    const parsed = Z.DeductionTip.parse(res.body[0]);
    expect(parsed).toEqual(res.body[0]);
  });

  test("GET /progress/{userId}", async () => {
    const res = await http(base, "progress/user_1");
    expect(res.status).toBe(200);
    const v = ajv.getSchema("https://schemas.iberitax.local/user_progress.schema.json");
    expect(v(res.body)).toBe(true);
    const parsed = Z.UserProgress.parse(res.body);
    expect(parsed).toEqual(res.body);
  });

  test("POST /modelo100/validate", async () => {
    const validPayload = {
      taxYear: 2024,
      taxpayer: { nif: "X1234567A", fullName: "Alex Garcia", residencyStatus: "resident" },
      incomes: [{ category: "employment", gross: 1000 }],
      totals: { taxableBase: 1000, calculatedTax: 100, finalTaxDue: 0 }
    };
    const res = await http(base, "modelo100/validate", {
      method: "POST",
      body: JSON.stringify(validPayload)
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ valid: true });
  });
});
