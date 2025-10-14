#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("artifacts","jobs");
fs.mkdirSync(outDir, { recursive: true });

const ts = new Date().toISOString();
const payload = { job: "export.refresh", ts, note: "stub-only" };
fs.writeFileSync(path.join(outDir, "export.refresh.last.json"), JSON.stringify(payload, null, 2));
console.log("OK 11.12.job.export.refresh");
