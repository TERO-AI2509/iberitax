import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function resolveSchemaPath() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const pkgRoot = path.resolve(here, "..", "..");
  const candidates = [
    path.join(pkgRoot, "contracts", "modelo100.schema.json"),
    path.resolve(process.cwd(), "packages/ocr/contracts/modelo100.schema.json"),
    path.resolve(process.cwd(), "contracts/modelo100.schema.json")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("modelo100.schema.json not found");
}

function resolveSample(rel) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, "samples", rel);
}

const schema = JSON.parse(fs.readFileSync(resolveSchemaPath(), "utf8"));
const validate = ajv.compile(schema);

function check(file) {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const ok = validate(data);
  if (!ok) {
    const err = ajv.errorsText(validate.errors, { separator: " | " });
    throw new Error(`${path.basename(file)} failed: ${err}`);
  }
  console.log(`PASS ${path.basename(file)}`);
}

check(resolveSample("bank-interest.sample.json"));
check(resolveSample("dividend.sample.json"));
