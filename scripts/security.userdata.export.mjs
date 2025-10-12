#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { repoWalk, findMatches, loadRedaction, applyAllRules } from "./security.userdata.util.mjs";

const [,, query, flag] = process.argv;
if (!query) {
  console.error("Usage: node scripts/security.userdata.export.mjs \"<query>\" [--redact]");
  process.exit(1);
}
const root = process.cwd();
const files = repoWalk(root);
const matches = findMatches(files, query);

const ts = new Date().toISOString().replace(/[-:]/g,"").replace(/\..*/,"");
const baseDir = path.join("artifacts","modelo100","export", ts);
fs.mkdirSync(baseDir, { recursive: true });

const manifest = { ok:true, query, total: matches.length, items: matches };
fs.writeFileSync(path.join(baseDir,"manifest.json"), JSON.stringify(manifest,null,2));

const makeZip = (entries, outFile)=>{
  // simple tar.gz for portability
  const tar = [];
  for (const {file} of entries) {
    const rel = path.relative(root,file);
    tar.push(`***FILE*** ${rel}\n` + fs.readFileSync(file,"utf8") + "\n***END***\n");
  }
  const gz = zlib.gzipSync(tar.join(""));
  fs.writeFileSync(outFile, gz);
};

makeZip(matches, path.join(baseDir,"export.tar.gz"));

if (flag === "--redact") {
  const {rules, strategies} = loadRedaction();
  const redir = path.join(baseDir,"redacted");
  fs.mkdirSync(redir, { recursive: true });
  for (const {file} of matches) {
    const rel = path.relative(root,file);
    const outPath = path.join(redir, rel.replace(/\//g,"__"));
    const src = fs.readFileSync(file,"utf8");
    const { out } = applyAllRules(src, rules, strategies);
    fs.writeFileSync(outPath, out);
  }
}

console.log(JSON.stringify({ ok:true, export_dir: baseDir, total: matches.length }));
