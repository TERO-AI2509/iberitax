#!/usr/bin/env node
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

function sh(cmd, env = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, { shell: true, stdio: "inherit", env: { ...process.env, ...env } });
    p.on("exit", code => code === 0 ? resolve() : reject(new Error(cmd+" -> "+code)));
  });
}

const main = async () => {
  try {
    process.env.LAWYER_POST_SECRET = process.env.LAWYER_POST_SECRET || "dev-secret";
    process.env.LAWYER_API_BASE = process.env.LAWYER_API_BASE || "http://localhost:8787";

    const mock = spawn('npm', ['run','lawyer:mock'], { shell: true, stdio: "ignore", env: process.env, detached: true });
    mock.unref();
    await sleep(500);

    await sh('node scripts/jobs/health.ping.mjs');
    await sh('npm run web:build');
    await sh('node scripts/jobs/export.refresh.mjs');

    console.log("OK 11.12.deployment");
  } catch (e) {
    console.error("FAIL 11.12.deployment", String(e && e.message || e));
    process.exit(1);
  }
};

main();
