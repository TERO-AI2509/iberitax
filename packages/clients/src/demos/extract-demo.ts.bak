import type { ExtractResult } from "@iberitax/extractor";
// import { extract } from "../lib/client"; // <-- adjust to your actual client export
// If your typed client is default-exported, fix the import accordingly.

type Envelope<T> = { ok: boolean; data?: T; errors?: Array<{code:string;message:string;path?:string}> };

// Example call signature your client likely exposes:
// declare function extract<T>(key: string): Promise<Envelope<T>>;

// Pretend usage just to enforce compile-time checks:
async function demo(extract: <T>() => Promise<Envelope<T>>) {
  // The generic param wires schema-derived result:
  const res = await extract<ExtractResult>();
  if (res.ok && res.data) {
    // ✅ These lines should type-check based on your JSON Schema in extract.schema.ts
    res.data.fileKey;            // string | undefined (as per initial schema)
    // res.data.pages;           // ❌ Will error until you add `pages` to the schema
  }
}
