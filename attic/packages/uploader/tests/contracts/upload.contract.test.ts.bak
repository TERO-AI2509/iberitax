import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";
import {
  validateUploadInitRequest,
  validateUploadInitResponse
} from "../../src";

const fx = (name: string) =>
  JSON.parse(fs.readFileSync(path.join(process.cwd(), "tests", "fixtures", name), "utf8"));

describe("Uploader contracts (schemas + Ajv)", () => {
  test("UploadInitRequest: valid fixture passes", () => {
    const data = fx("init-request.valid.json");
    const ok = validateUploadInitRequest(data);
    if (!ok) console.error((validateUploadInitRequest as any).errors);
    expect(ok).toBe(true);
  });

  test("UploadInitRequest: invalid fixture fails", () => {
    const data = fx("init-request.invalid.json");
    const ok = validateUploadInitRequest(data);
    expect(ok).toBe(false);
  });

  test("UploadInitResponse: valid fixture passes", () => {
    const data = fx("init-response.valid.json");
    const ok = validateUploadInitResponse(data);
    if (!ok) console.error((validateUploadInitResponse as any).errors);
    expect(ok).toBe(true);
  });

  test("UploadInitResponse: invalid fixture fails", () => {
    const data = fx("init-response.invalid.json");
    const ok = validateUploadInitResponse(data);
    expect(ok).toBe(false);
  });
});
