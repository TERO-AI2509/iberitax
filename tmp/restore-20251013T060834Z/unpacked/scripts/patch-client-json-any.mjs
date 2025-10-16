import fs from "node:fs";

const file = "packages/uploader/src/client.ts";
let s = fs.readFileSync(file, "utf8");

// Make the JSON result explicitly 'any' (runtime unchanged)
s = s.replace(/const\s+json\s*=\s*await\s*(\w+)\.json\(\)/, 'const json: any = await $1.json()');

fs.writeFileSync(file, s);
console.log("✅ patched:", file);
