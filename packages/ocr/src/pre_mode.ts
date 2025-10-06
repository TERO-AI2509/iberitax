export type PreMode = "fixed" | "minimal" | "adaptive";
export function getPreMode(): PreMode {
  const v = String(process.env.PRE_MODE || "fixed").toLowerCase();
  if (v === "minimal" || v === "adaptive") return v;
  return "fixed";
}
