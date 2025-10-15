export function isAssetPath(p: string) {
  return p.startsWith("/_next") || p.startsWith("/favicon") || p.startsWith("/assets");
}
export function isPublicPath(p: string) {
  if (isAssetPath(p)) return true;
  if (p === "/" || p.startsWith("/login") || p.startsWith("/docs") || p.startsWith("/api/public/")) return true;
  return false;
}
