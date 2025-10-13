import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaPath = path.join(__dirname, "..", "schemas", "extraction_result.schema.json");
const extractorPath = path.join(__dirname, "ai.extract.rules.mjs");
const fixturesDir = path.join(__dirname, "..", "fixtures", "tax");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

function collectTxt(dir) {
  const entries = fs.readdirSync(dir);
  return entries.filter(f => f.endsWith(".txt")).map(f => path.join(dir, f));
}

function runExtractorOn(file) {
  const res = spawnSync(process.execPath, [extractorPath, file], { encoding: "utf8" });
  if (res.status !== 0) throw new Error("Extractor failed for " + file + " " + (res.stderr || ""));
  return JSON.parse(res.stdout);
}

const files = collectTxt(fixturesDir);
if (files.length === 0) {
  console.error("No fixtures found");
  process.exit(1);
}

let ok = 0;
let fail = 0;
for (const f of files) {
  try {
    const out = runExtractorOn(f);
    const valid = validate(out);
    if (!valid) {
      fail++;
      console.error("Invalid JSON for " + f);
      console.error(JSON.stringify(validate.errors, null, 2));
    } else {
      ok++;
    }
  } catch (e) {
    fail++;
    console.error("Error for " + f);
    console.error(e.message);
  }
}

if (fail > 0) {
  console.error("Validation failed " + fail + " of " + files.length);
  process.exit(1);
} else {
  console.log("Validation green on " + ok + " fixtures");
  process.exit(0);
}
