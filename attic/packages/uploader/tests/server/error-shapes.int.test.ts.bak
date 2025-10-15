import express from "express";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import request from "supertest";
import { LocalFSAdapter } from "../../src/storage/localfs";
import { createUploaderRouter } from "../../src/server/router";

async function tmpRootPath() {
  return fs.mkdtemp(path.join(os.tmpdir(), "iberitax-uploader-errors-"));
}

test("init: invalid request -> 422 ValidationError with standardized envelope", async () => {
  const app = express();
  const adapter = new LocalFSAdapter({ rootDir: await tmpRootPath() });
  app.use(createUploaderRouter({ adapter }));

  const res = await request(app).post("/uploader/init").send({ bad: true });
  expect(res.status).toBe(422);
  expect(res.body.ok).toBe(false);
  expect(res.body.code).toBe("ValidationError");
  expect(typeof res.body.error).toBe("string");
});

test("put: disallowed content-type -> 415 ContentTypeNotAllowed", async () => {
  const app = express();
  const adapter = new LocalFSAdapter({ rootDir: await tmpRootPath() });
  app.use(createUploaderRouter({ adapter }));

  const init = await request(app)
    .post("/uploader/init")
    .send({ filename: "demo.txt", contentType: "text/plain", size: 3 });

  expect(init.status).toBe(200);
  const { key, putURL } = init.body.data;
  expect(key).toMatch(/^uploads\//);
  expect(putURL).toMatch(/^\/upload\//);

  const bad = await request(app)
    .put(putURL)
    .set("content-type", "image/png")
    .set("content-length", "3")
    .send(Buffer.from("abc"));

  expect(bad.status).toBe(415);
  expect(bad.body.ok).toBe(false);
  expect(bad.body.code).toBe("ContentTypeNotAllowed");
});
