import Fastify from "fastify";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, "../fixtures");
const schemasDir = path.join(__dirname, "../../../schemas");

const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

function buildAjv() {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  addFormats(ajv);
  for (const f of fs.readdirSync(schemasDir).filter((x) => x.endsWith(".schema.json"))) {
    ajv.addSchema(readJSON(path.join(schemasDir, f)));
  }
  return ajv;
}

export function buildServer() {
  const fastify = Fastify({ logger: false });
  const ajv = buildAjv();

  const extraction = readJSON(path.join(fixturesDir, "extraction_result.json"));
  const plainSummary = readJSON(path.join(fixturesDir, "plain_summary.json"));
  const deductionTips = readJSON(path.join(fixturesDir, "deduction_tips.json"));
  const userProgress = readJSON(path.join(fixturesDir, "user_progress.json"));

  fastify.get("/health", async () => ({ ok: true }));

  fastify.post("/extractions", async (req, reply) => {
    const body = req.body ?? {};
    if (!body.sources || !Array.isArray(body.sources)) {
      return reply.code(400).send({ error: "sources[] required" });
    }
    return reply.code(202).send({ jobId: "job_123" });
  });

  fastify.get("/extractions/:jobId", async (req) => {
    return extraction;
  });

  fastify.post("/summaries/plain", async (req) => {
    return plainSummary;
  });

  fastify.post("/tips/deductions", async (req) => {
    return deductionTips;
  });

  fastify.get("/progress/:userId", async (req) => {
    return userProgress;
  });

  fastify.post("/modelo100/validate", async (req) => {
    const schemaId = "https://schemas.iberitax.local/modelo100.schema.json";
    const validate = ajv.getSchema(schemaId);
    const valid = validate ? validate(req.body) : false;
    return { valid: Boolean(valid) };
  });

  return fastify;
}
