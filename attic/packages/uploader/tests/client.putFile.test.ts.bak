import { putFile } from "../src";

describe("putFile (node/fetch fallback)", () => {
  const origFetch = global.fetch as any;
  afterEach(() => { (global as any).fetch = origFetch; });

  test("performs PUT with content-type and returns bytes", async () => {
    const calls: any[] = [];
    (global as any).fetch = async (url: string, init: any) => {
      calls.push({ url, init });
      return { ok: true, status: 200, text: async () => "" };
    };
    const data = new Uint8Array([1,2,3,4,5]);
    const res: any = await putFile("http://example.test/upload/abc", data, "application/octet-stream");
    expect(res.ok).toBe(true);
    if ((res as any).ok) expect((res as any).data.bytes).toBe(5);
    expect(calls[0].url).toBe("http://example.test/upload/abc");
    expect(calls[0].init.method).toBe("PUT");
    expect(calls[0].init.headers["content-type"]).toBe("application/octet-stream");
    expect(calls[0].init.body).toBeInstanceOf(Uint8Array);
  });
});
