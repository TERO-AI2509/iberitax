import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import { app } from "../src/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server;
let base;

beforeAll(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const { port } = server.address();
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  if (server) await new Promise((r) => server.close(() => r()));
});

function getStorageRoot() {
  const here = path.join(__dirname, "..");
  const defaultRoot = path.join(here, "uploads");
  return process.env.IBERITAX_STORAGE_ROOT || defaultRoot;
}

test("initUpload returns a well-formed downloadUrl and GET returns 200 after writing fixture", async () => {
  const initResp = await fetch(`${base}/api/initUpload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: "sample.pdf" }),
  });
  expect(initResp.ok).toBe(true);
  const json = await initResp.json();
  expect(json.ok).toBe(true);
  expect(typeof json.downloadUrl).toBe("string");
  expect(json.downloadUrl).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/files\/\d{4}\/\d{2}\/\d{2}\/[a-f0-9]{32}\.pdf$/);

  const rel = json.storageKey;
  const abs = path.join(getStorageRoot(), rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, Buffer.from("%PDF-1.4\n%stub\n"));

  const getResp = await fetch(json.downloadUrl);
  expect(getResp.status).toBe(200);
});
