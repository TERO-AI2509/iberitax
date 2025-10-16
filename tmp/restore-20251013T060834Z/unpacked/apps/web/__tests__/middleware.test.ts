import { isAssetPath, isPublicPath } from "../lib/mw/helpers";

describe("middleware helpers", () => {
  test.each([
    ["/_next/static/chunk.js", true],
    ["/favicon.ico", true],
    ["/assets/logo.svg", true],
    ["/api/public/ping", true],
    ["/login", true],
    ["/docs/fetching", true],
    ["/api/private/whoami", false],
    ["/account", false],
  ])("isPublicPath(%s)", (p, expected) => {
    expect(isPublicPath(p as string)).toBe(expected as boolean);
  });

  test.each([
    ["/_next/whatever", true],
    ["/favicon.svg", true],
    ["/assets/x", true],
    ["/api/public/ping", false],
    ["/", false],
  ])("isAssetPath(%s)", (p, expected) => {
    expect(isAssetPath(p as string)).toBe(expected as boolean);
  });
});
