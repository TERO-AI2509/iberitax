// demos/call-upload.mjs
// STEP-05: request a presigned URL then PUT a small payload to the stub.
// Prints a success checkmark and tiny summary.

import http from "node:http";

const PRESIGN = process.env.STUB_URL_PRESIGN || "http://localhost:4000/upload/presign";

function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = Buffer.from(JSON.stringify(payload));
    const req = http.request(
      { protocol: u.protocol, hostname: u.hostname, port: u.port, path: u.pathname,
        method: "POST", headers: { "Content-Type": "application/json", "Content-Length": data.length } },
      (res) => { let b=""; res.setEncoding("utf8"); res.on("data", c => b+=c); res.on("end", () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(b || "{}") }); } catch(e){ reject(e); }
      }); }
    );
    req.on("error", reject); req.write(data); req.end();
  });
}

function putRaw(url, contentType, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request(
      { protocol: u.protocol, hostname: u.hostname, port: u.port, path: u.pathname,
        method: "PUT", headers: { "Content-Type": contentType, "Content-Length": body.length } },
      (res) => { let b=""; res.setEncoding("utf8"); res.on("data", c => b+=c); res.on("end", () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(b || "{}") }); } catch(e){ reject(e); }
      }); }
    );
    req.on("error", reject); req.write(body); req.end();
  });
}

(async () => {
  try {
    const filename = "demo.pdf";
    const contentType = "application/pdf";

    const presign = await postJson(PRESIGN, { filename, contentType });
    if (presign.status !== 200 || !presign.json?.ok) {
      console.error("❌ /upload/presign failed", presign);
      process.exit(1);
    }

    const { url, method, headers, key } = presign.json.data || {};
    if (method !== "PUT" || !url) {
      console.error("❌ presign missing URL or method", presign.json);
      process.exit(1);
    }

    const put = await putRaw(url, headers?.["Content-Type"] || contentType, Buffer.from("%PDF-1.4\n%stub\n"));
    if (put.status === 200 && put.json?.ok) {
      console.log("✅ upload ok");
      console.log(JSON.stringify({ key, receivedBytes: put.json?.data?.receivedBytes }, null, 2));
    } else {
      console.error("❌ upload failed", put);
      process.exit(1);
    }
  } catch (e) {
    console.error("❌ upload error", e?.message || e);
    process.exit(1);
  }
})();
