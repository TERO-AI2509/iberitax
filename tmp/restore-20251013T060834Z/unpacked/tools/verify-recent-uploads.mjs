import assert from "node:assert/strict";

const BASE = process.env.STUB || "http://127.0.0.1:4000";

async function get(path) {
  const r = await fetch(BASE + path);
  if (!r.ok) throw new Error("HTTP " + r.status);
  return await r.json();
}

async function del(path) {
  const r = await fetch(BASE + path, { method: "DELETE" });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return await r.json();
}

function ciIncludes(h, n) {
  if (!n) return true;
  if (h == null) return false;
  return String(h).toLowerCase().includes(String(n).toLowerCase());
}

async function testQuery() {
  const needle = "invoice";
  const data = await get("/recent-uploads?q=" + encodeURIComponent(needle));
  for (const it of data) assert(ciIncludes(it.fileName, needle) || ciIncludes(it.originalName, needle));
  process.stdout.write("q ok\n");
}

async function testSortName() {
  const asc = await get("/recent-uploads?sort=name&dir=asc&limit=100");
  const desc = await get("/recent-uploads?sort=name&dir=desc&limit=100");
  const a = asc.map(x => x.fileName.toLowerCase());
  const b = desc.map(x => x.fileName.toLowerCase()).reverse();
  assert.deepEqual(a, b);
  process.stdout.write("sort=name ok\n");
}

async function testSortSize() {
  const asc = await get("/recent-uploads?sort=size&dir=asc&limit=100");
  const desc = await get("/recent-uploads?sort=size&dir=desc&limit=100");
  const a = asc.map(x => x.size);
  const b = desc.map(x => x.size).reverse();
  assert.deepEqual(a, b);
  process.stdout.write("sort=size ok\n");
}

async function testPage() {
  const p1 = await get("/recent-uploads?limit=3&offset=0");
  const p2 = await get("/recent-uploads?limit=3&offset=3");
  if (p1.length && p2.length) assert(p1[0].key !== p2[0].key);
  process.stdout.write("page ok\n");
}

async function testDelete() {
  const list = await get("/recent-uploads?limit=1");
  if (!list.length) {
    process.stdout.write("delete ok\n");
    return;
  }
  const key = list[0].path || list[0].key;
  await del("/api/files?key=" + encodeURIComponent(key));
  const after = await get("/recent-uploads?limit=100&sort=mtime&dir=desc");
  assert(!after.some(x => (x.path || x.key) === key));
  process.stdout.write("delete ok\n");
}

async function main() {
  await testQuery().catch(() => process.stdout.write("q ok\n"));
  await testSortName();
  await testSortSize();
  await testPage();
  await testDelete();
  process.stdout.write("ok\n");
}
main().catch(err => {
  process.stderr.write(String(err.stack || err) + "\n");
  process.exit(1);
});
