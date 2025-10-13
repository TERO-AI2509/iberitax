import { URL } from "node:url";
export function scoreRule(rule, opts = {}) {
  const now = new Date();
  const fiscalYear = Number(process.env.FISCAL_YEAR || opts.fiscalYear || now.getUTCFullYear());
  const jurisdiction = (rule?.jurisdiction || "").toLowerCase();
  const src = normalizeSource(rule?.source);
  const authority = authorityScore(src);
  const clarity = clarityScore(rule);
  const applicability = applicabilityScore({ jurisdiction, fiscalYear, rule });
  return { authority: clamp01(authority), clarity: clamp01(clarity), applicability: clamp01(applicability) };
}
function normalizeSource(source) {
  if (!source) return { kind: "unknown", host: "" };
  try {
    const u = new URL(source.url || source.href || source.link || "");
    return { kind: kindFromHost(u.host), host: u.host };
  } catch {
    const host = String(source?.host || source?.domain || "").toLowerCase();
    return { kind: kindFromHost(host), host };
  }
}
function kindFromHost(host) {
  const h = String(host || "").toLowerCase();
  if (!h) return "unknown";
  if (h.includes("aeat.es")) return "aeat";
  if (h.includes("boe.es")) return "boe";
  if (/\b(gencat|junta|xunta|navarra|gobiernodecanarias|canarias|andalucia|castillayleon|lamancha|aragon|asturias|cantabria|euskadi|galicia|rioja|murcia|valencia|balears|illesbalears|extremadura)\b/.test(h)) return "regional";
  return "other";
}
function authorityScore(src) { switch (src.kind) { case "aeat": return 1.0; case "boe": return 0.9; case "regional": return 0.7; case "other": return 0.4; default: return 0.3; } }
function clarityScore(rule) {
  const hasId = Boolean(rule?.id || rule?.code || rule?.article);
  const hasTitle = Boolean(rule?.title || rule?.name);
  const hasDefinition = textLooksUnambiguous(rule?.text || rule?.definition || "");
  const hasNormalized = Boolean(rule?.normalized || rule?.fields);
  let score = 0;
  if (hasId) score += 0.25;
  if (hasTitle) score += 0.25;
  if (hasDefinition) score += 0.3;
  if (hasNormalized) score += 0.2;
  return Math.min(1, Math.max(0, score));
}
function textLooksUnambiguous(s) {
  if (!s || typeof s !== "string") return false;
  const t = s.toLowerCase();
  const strong = /(deberá|debera|deberán|deberan|debe|shall|must|aplicará|aplicara|se aplicará|queda|es obligatorio)/.test(t);
  const weak = /(podrá|podra|puede|pueden|podrían|podrian|podrá ser|podra ser|orientativo|ejemplo|ambiguous|ambiguo)/.test(t);
  if (strong && !weak) return true;
  if (weak && !strong) return false;
  return t.length > 80 && /[.;:]/.test(t);
}
function applicabilityScore({ jurisdiction, fiscalYear, rule }) {
  const jOk = jurisdiction === "es" || jurisdiction === "es-es" || jurisdiction.includes("spain");
  const year = coerceYear(rule?.year || rule?.fiscalYear || rule?.effectiveYear);
  const yOk = year ? Number(year) === Number(fiscalYear) : true;
  const region = String(rule?.region || rule?.community || "").toLowerCase();
  const foreign = /(portugal|france|italy|uk|germany|usa|united states|mexico|argentina|chile|peru|brasil|brazil)/.test(region);
  if (foreign) return 0;
  if (jOk && yOk) return 1.0;
  if (jOk && !yOk) return 0.5;
  if (!jOk && yOk) return 0.3;
  return 0.1;
}
function coerceYear(y) { const n = Number(y); if (!Number.isFinite(n)) return null; return (n >= 1900 && n < 3000) ? n : null; }
function clamp01(x) { if (!Number.isFinite(x)) return 0; return Math.max(0, Math.min(1, x)); }
