import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { Readable } from "node:stream";
import { LocalFSAdapter } from "../../src/storage/localfs";
import { makeStorageKey } from "../../src/keygen";

const FIXED_DATE = new Date("2025-09-27T12:00:00.000Z");
const FIXED_UUID = "123e4567-e89b-12d3-a456-426614174000";

function tmpRoot() {
  const p = fs.mkdtemp(path.join(os.tmpdir(), "iberitax-uploader-"));
  return p;
}

test("makeStorageKey formats YYYY/MM/DD and preserves safe extension", () => {
  const key = makeStorageKey({ filename: "demo.pdf", now: FIXED_DATE, uuid: FIXED_UUID });
  expect(key).toBe("uploads/2025/09/27/123e4567-e89b-12d3-a456-426614174000.pdf");
});

test("makeStorageKey falls back to .bin for weird extensions", () => {
  const key = makeStorageKey({ filename: "weird..ext!!", now: FIXED_DATE, uuid: FIXED_UUID });
  expect(key.endsWith(".bin")).toBe(true);
  expect(key.startsWith("uploads/2025/09/27/")).toBe(true);
});

test("LocalFSAdapter.putStream writes bytes to the resolved path", async () => {
  const root = await tmpRoot();
  const adapter = new LocalFSAdapter({ rootDir: root });
  const key = makeStorageKey({ filename: "demo.pdf", now: FIXED_DATE, uuid: FIXED_UUID });

  const data = Buffer.from("hello world");
  const res = await adapter.putStream(key, Readable.from(data), { contentType: "application/pdf", size: data.length });
  expect(res.ok).toBe(true);

  const saved = await fs.readFile(adapter.resolveKeyPath(key), "utf8");
  expect(saved).toBe("hello world");
});

test("LocalFSAdapter rejects disallowed contentType", async () => {
  const root = await tmpRoot();
  const adapter = new LocalFSAdapter({ rootDir: root });
  const key = makeStorageKey({ filename: "demo.pdf", now: FIXED_DATE, uuid: FIXED_UUID });

  const res = await adapter.putStream(key, Readable.from("data"), { contentType: "image/png", size: 4 });
  expect(res.ok).toBe(false);
  if (!res.ok) expect(res.error).toMatch(/Unsupported contentType/);
});

test("LocalFSAdapter rejects invalid key format", async () => {
  const root = await tmpRoot();
  const adapter = new LocalFSAdapter({ rootDir: root });
  const badKey = "uploads/../../evil.pdf";

  const res = await adapter.putStream(badKey as any, Readable.from("x"), { contentType: "application/pdf", size: 1 });
  expect(res.ok).toBe(false);
  if (!res.ok) expect(res.error).toMatch(/invalid key format|unsafe key path/);
});
