// demos/call-extraction.mjs
// STEP-04: call the local stub /extract and print a tiny, useful summary.

import http from "node:http";

const ENDPOINT = process.env.STUB_URL || "http://localhost:4000/extract";

/** Simple POST using Node's http to avoid extra deps */
function postJson(url, payload = {}) {
  return new Promise((resolve, reject) => {
    const { hostname, port, pathname, protocol } = new URL(url);
    const data = Buffer.from(JSON.stringify(payload));

    const req = http.request(
      {
        protocol,
        hostname,
        port,
        path: pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": data.length
        }
      },
      (res) => {
        let body = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(body || "{}");
            resolve({ status: res.statusCode, json });
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    // For now we don’t care about payload; send a tiny placeholder
    const { status, json } = await postJson(ENDPOINT, { files: ["demo.pdf"] });

    if (status === 200 && json && json.ok) {
      console.log("✅ /extract ok");

      // Safely pluck a few fields if present
      const jobId = json?.data?.jobId ?? "(missing)";
      const taxYear = json?.data?.modelo100?.taxYear ?? "(missing)";
      const finalTaxDue = json?.data?.modelo100?.totals?.finalTaxDue ?? "(missing)";

      console.log(
        JSON.stringify(
          { jobId, modelo100: { taxYear }, totals: { finalTaxDue } },
          null,
          2
        )
      );
    } else {
      console.error("❌ /extract failed", { status, body: json });
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ /extract error", err?.message || err);
    process.exit(1);
  }
})();
