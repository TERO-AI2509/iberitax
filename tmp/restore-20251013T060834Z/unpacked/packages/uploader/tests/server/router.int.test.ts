import express from "express";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import request from "supertest";
import { LocalFSAdapter } from "../../src/storage/localfs";
import { createUploaderRouter } from "../../src/server/router";

function tmpRootPath() {
  return fs.mkdtemp(path.join(os.tmpdir(), "iberitax-uploader-router-"));
}

test("health -> ok", async () => {
  const app = express();
  // dummy adapter; not used for health
  const adapter = new LocalFSAdapter({ rootDir: await tmpRootPath() });
  app.use(createUploaderRouter({ adapter }));
  const res = await request(app).get("/uploader/health");
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true, data: true });
});

test("init -> returns key + putURL; then PUT saves bytes", async () => {
  const root = await tmpRootPath();
  const adapter = new LocalFSAdapter({ rootDir: root });
  const app = express();
  app.use(createUploaderRouter({ adapter }));

  // 1) init
  const init = await request(app)
    .post("/uploader/init")
    .set("content-type", "application/json")
    .send({ filename: "demo.pdf", contentType: "application/pdf", size: 11 });
  expect(init.status).toBe(200);
  expect(init.body?.ok).toBe(true);
  const { key, putURL } = init.body.data;
  expect(typeof key).toBe("string");
  expect(typeof putURL).toBe("string");
  // putURL should contain year/month/day segments from key
  const m = key.match(/^uploads\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)$/);
  expect(m).toBeTruthy();
  if (!m) throw new Error("bad key shape");
  const [, y, mo, d, basename] = m;
  expect(putURL).toBe(`/upload/${y}/${mo}/${d}/${basename}`);

  // 2) PUT bytes to the returned URL
  const data = Buffer.from("hello world");
  const put = await request(app)
    .put(putURL)
    .set("content-type", "application/pdf")
    .set("content-length", String(data.length))
    .send(data);
  expect(put.status).toBe(200);
  expect(put.body).toEqual({ ok: true, data: true });

  // 3) Verify file exists with exact contents
  const savedPath = adapter.resolveKeyPath(key);
  const saved = await fs.readFile(savedPath, "utf8");
  expect(saved).toBe("hello world");
});
