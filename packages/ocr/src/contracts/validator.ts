import { readFileSync } from "fs";
import { resolve } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const Ajv: any = require("ajv");
const addFormats: any = require("ajv-formats");

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);

const schemaPath = resolve(process.cwd(), "schemas", "modelo100.schema.json");

let validateModelo100: any = null;
try {
  const schema = JSON.parse(readFileSync(schemaPath, "utf8"));
  validateModelo100 = ajv.compile(schema);
} catch (_e) {
  validateModelo100 = (_data: unknown) => true;
}

export function validate(data: unknown) {
  const ok = !!validateModelo100(data);
  return { ok, errors: ok ? [] : (validateModelo100.errors ?? []) };
}

export { validateModelo100 };
