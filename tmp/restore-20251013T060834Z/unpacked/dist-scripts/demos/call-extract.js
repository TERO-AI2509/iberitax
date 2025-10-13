"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// demos/call-extract.ts
const src_1 = require("../packages/clients/src");
const client = (0, src_1.createExtractorClient)({ baseURL: process.env.BASE_URL || "http://localhost:4000" });
(async () => {
    const resp = await client.extract({ key: "uploads/demo.pdf" });
    if (resp.ok) {
        // ✅ Type-safe access (will fail to compile if fields don’t exist or are wrong type)
        console.log("docType:", resp.data.docType);
        console.log("pages x 2 =", resp.data.pages * 2);
    }
    else {
        console.error("❌ extract failed:", resp.errors.map(e => e.message).join("; "));
        process.exitCode = 1;
    }
})();
