describe("share URL shape", () => {
  test("builds a valid /files/<key> URL", () => {
    const baseURL = "http://127.0.0.1:4000";
    const key = "folder/sub/file.pdf";
    const url = new URL(`/files/${encodeURIComponent(key)}`, baseURL).toString();
    expect(url).toMatch(/^http:\/\/127\.0\.0\.1:4000\/files\//);
    const parsed = new URL(url);
    expect(parsed.hostname).toBe("127.0.0.1");
    // hostname ok and path starts with /files/
    expect(parsed.pathname.startsWith("/files/")).toBe(true);
  });
});
