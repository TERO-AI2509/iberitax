import fs from "node:fs";
import path from "node:path";

const file = "packages/uploader/tests/contracts/upload.contract.test.ts";
let s = fs.readFileSync(file, "utf8");

// Ensure we can use path.join in the test
if (!/from ["']node:path["']/.test(s)) {
  s = s.replace(/(^\s*import[^\n]*\n)/, `$1import path from "node:path";\n`);
}

// Replace: new URL(`../fixtures/${name}`, import.meta.url)
// With:    path.join(process.cwd(), "tests", "fixtures", name)
const needle = "new URL(`../fixtures/${name}`, import.meta.url)";
if (s.includes(needle)) {
  s = s.split(needle).join('path.join(process.cwd(), "tests", "fixtures", name)');
}

fs.writeFileSync(file, s);
console.log("✅ patched:", file);
