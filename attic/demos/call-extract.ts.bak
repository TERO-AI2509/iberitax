// demos/call-extract.ts
import { createExtractorClient, type ApiResult } from "../packages/clients/src";

// ⬇️ Replace this with your schema-derived type later.
// Example shape to demonstrate compile-time typing:
type MyExtract = {
  pages: number;
  docType: string;
  // add fields that your schema guarantees
};

const client = createExtractorClient({ baseURL: process.env.BASE_URL || "http://localhost:4000" });

(async () => {
  const resp: ApiResult<MyExtract> = await client.extract<MyExtract>({ key: "uploads/demo.pdf" });

  if (resp.ok) {
    // ✅ Type-safe access (will fail to compile if fields don’t exist or are wrong type)
    console.log("docType:", resp.data.docType);
    console.log("pages x 2 =", resp.data.pages * 2);
  } else {
    console.error("❌ extract failed:", resp.errors.map(e => e.message).join("; "));
    process.exitCode = 1;
  }
})();
