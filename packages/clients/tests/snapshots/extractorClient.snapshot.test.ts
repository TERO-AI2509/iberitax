import fs from "node:fs";
import path from "node:path";
import { createExtractorClient } from "../../src/index";

const readJson = (p: string) => JSON.parse(fs.readFileSync(p, "utf8"));

/**
 * Minimal FetchResponse shape to satisfy our client:
 * - ok: boolean
 * - status: number
 * - json(): Promise<any>
 * - text(): Promise<string>
 */
function makeFetchResponse(body: any, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as any;
}

describe("Extractor client snapshots", () => {
  const base = path.join(__dirname, "..", "fixtures", "extract");
  const valid = readJson(path.join(base, "valid.json"));
  const invalid = readJson(path.join(base, "invalid.json"));

  const client = createExtractorClient({ baseURL: "http://example.invalid" });

  afterEach(() => {
    // @ts-ignore
    global.fetch = undefined;
    jest.restoreAllMocks();
  });

  it("success response shape matches snapshot", async () => {
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse(valid, 200));

    const res = await client.extract({ key: "uploads/demo.pdf" });
    // Snapshot the normalized result shape from the client
    expect(res).toMatchSnapshot();
  });

  it("validation failure shape matches snapshot", async () => {
    // Simulate 422 Unprocessable with invalid payload from server
    // @ts-ignore
    global.fetch = jest.fn().mockResolvedValue(makeFetchResponse(invalid, 422));

    let out: unknown;
    try {
      out = await client.extract({ key: "uploads/bad.pdf" });
    } catch (e) {
      out = { threw: true, message: (e as Error).message };
    }
    expect(out).toMatchSnapshot();
  });
});
