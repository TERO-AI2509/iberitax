#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { repoWalk, findMatches } from "./security.userdata.util.mjs";

const [,, query] = process.argv;
if (!query) {
  console.error("Usage: node scripts/security.userdata.delete.mjs \"<query>\"");
  process.exit(1);
}
const APPLY = !!process.env.APPLY;
const root = process.cwd();
const files = repoWalk(root);
const matches = findMatches(files, query);

const ts = new Date().toISOString().replace(/[-:]/g,"").replace(/\..*/,"");
const qdir = path.join("report","quarantine", ts);
if (APPLY) fs.mkdirSync(qdir, { recursive: true });

const ops = [];
for (const {file} of matches) {
  if (!APPLY) { ops.push({ file, action:"would-quarantine" }); continue; }
  try {
    const rel = path.relative(root, file).replace(/\//g,"__");
    const dest = path.join(qdir, rel);
    fs.renameSync(file, dest);
    // leave a tombstone:
    fs.writeFileSync(file, `/* Deleted on ${ts} due to GDPR erasure request */\n`);
    ops.push({ file, action:"quarantined", dest });
  } catch (e) {
    ops.push({ file, action:"error", error: String(e) });
  }
}

if (APPLY) {
  fs.writeFileSync(path.join(qdir,"delete.log.json"), JSON.stringify({ ok:true, query, ops }, null, 2));
}

console.log(JSON.stringify({ ok:true, query, total: matches.length, apply: APPLY, ops }));
