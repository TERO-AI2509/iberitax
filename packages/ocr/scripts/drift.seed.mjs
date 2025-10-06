#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG = path.resolve(__dirname, "..");
const OUT_DIR = path.join(PKG, "artifacts/export");

function rnd(seed) {
  let x = seed % 2147483647; if (x <= 0) x += 2147483646;
  return () => (x = x * 16807 % 2147483647) / 2147483647;
}

function arg(name, def) {
  const a = process.argv.find(x => x.startsWith(`--${name}=`));
  if (!a) return def;
  return a.split("=",2)[1];
}

function main() {
  const name = arg("name","seed");
  const seed = Number(arg("seed","12345"));
  const shift = Number(arg("shift","0"));
  const n = Number(arg("n","8"));
  const random = rnd(seed);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const rows = [["field","accuracy"]];
  for (let i=1;i<=n;i++) {
    const base = 88 + Math.floor(random()*8);
    const acc = Math.max(0, Math.min(100, base + shift + (random()*1.5 - 0.75)));
    rows.push([`field_${i}`, acc.toFixed(2)]);
  }
  const out = path.join(OUT_DIR, `${name}.csv`);
  fs.writeFileSync(out, rows.map(r=>r.join(",")).join("\n")+"\n");
  console.log(`Wrote ${out}`);
}
main();
