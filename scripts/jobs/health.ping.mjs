#!/usr/bin/env node
import http from "node:http";
import { URL } from "node:url";

const base = process.env.LAWYER_API_BASE || "http://localhost:8787";
const u = new URL("/", base);

const req = http.get(u, res => {
  const status = res.statusCode || 0;
  if (status >= 200 && status < 500) {
    console.log("OK 11.12.job.health", status);
  } else {
    console.error("FAIL 11.12.job.health", status);
    process.exit(1);
  }
});
req.on("error", err => {
  console.error("FAIL 11.12.job.health", String(err));
  process.exit(1);
});
