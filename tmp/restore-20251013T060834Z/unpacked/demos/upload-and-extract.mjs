import fs from "node:fs";
const BASE = process.env.API_BASE || "http://localhost:4000";

// 1) init
const initRes = await fetch(`${BASE}/uploader/init`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ filename: "demo.pdf", contentType: "application/pdf", size: 11 })
});
const initJson = await initRes.json();
if (!initJson.ok) throw new Error("init failed: " + initJson.error);
const { key, putURL } = initJson.data;
console.log("init ->", { key, putURL });

// 2) put
const data = Buffer.from("hello world");
const putRes = await fetch(`${BASE}${putURL}`, {
  method: "PUT",
  headers: { "content-type": "application/pdf", "content-length": String(data.length) },
  body: data
});
console.log("put ->", await putRes.json());

// 3) extract
const extRes = await fetch(`${BASE}/extract`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ key })
});
console.log("extract ->", await extRes.json());
