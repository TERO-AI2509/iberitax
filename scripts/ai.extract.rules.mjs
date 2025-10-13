import { computeProvenance } from "./ai.provenance.mjs";
import { scoreRule } from "./ai.score.rules.mjs";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readStdinSync() {
  try {
    const buf = fs.readFileSync(0);
    return buf.toString("utf8");
  } catch {
    return "";
  }
}

function loadTextFromArgOrStdin() {
  const args = process.argv.slice(2).filter(a => !a.startsWith("--"));
  if (args.length === 0) return readStdinSync();
  const p = args[0];
  return fs.readFileSync(p, "utf8");
}

function detectTax(text) {
  const m = text.match(/\b(IVA|IRPF|Impuesto sobre la Renta|Impuesto sobre Sociedades|IS)\b/i);
  if (!m) return { code: "DESCONOCIDO", name: "Desconocido" };
  const v = m[1].toUpperCase();
  if (v === "IVA") return { code: "IVA", name: "Impuesto sobre el Valor Añadido" };
  if (v === "IRPF" || /Renta/i.test(v)) return { code: "IRPF", name: "Impuesto sobre la Renta de las Personas Físicas" };
  if (v === "IS" || /Sociedades/i.test(v)) return { code: "IS", name: "Impuesto sobre Sociedades" };
  return { code: "OTRO", name: m[1] };
}

function detectIntent(text) {
  const intents = [];
  if (/\btipo(?:\s+impositivo)?\b/i.test(text) || /\b\d{1,2}(?:[.,]\d+)?\s?%/.test(text)) intents.push("tipo_impositivo");
  if (/\bexento\b|\bexención\b/i.test(text)) intents.push("exencion");
  if (/\bsujeci[oó]n\b|\bsujeto pasivo\b/i.test(text)) intents.push("sujecion");
  if (/\bdevengo\b/i.test(text)) intents.push("devengo");
  if (/\bdeducci[oó]n\b/i.test(text)) intents.push("deduccion");
  if (intents.length === 0) intents.push("regla_general");
  return intents;
}

function detectRates(text) {
  const rates = [];
  const re = /\b(\d{1,2}(?:[.,]\d+)?)\s?%\b/g;
  let m;
  while ((m = re.exec(text))) {
    rates.push({ kind: "porcentaje", value: parseFloat(m[1].replace(",", ".")) });
  }
  const tipoMatch = text.match(/\btipo(?:\s+impositivo)?\s+(general|reducido|superreducido)\b/i);
  if (tipoMatch) rates.push({ kind: "tipo", label: tipoMatch[1].toLowerCase() });
  return rates;
}

function detectThresholds(text) {
  const th = [];
  const re = /\b(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d+)?)\s?(€|euros)\b/gi;
  let m;
  while ((m = re.exec(text))) {
    th.push({ amount: parseFloat(m[1].replace(/\./g, "").replace(",", ".")), currency: "EUR" });
  }
  return th;
}

function detectCitations(text) {
  const refs = [];
  const boe = text.match(/\bBOE-\w-\d{4}-\d+\b/g);
  if (boe) boe.forEach(r => refs.push({ system: "BOE", ref: r }));
  const ley = text.match(/\bLey\s+\d+\/\d{4}\b/g);
  if (ley) ley.forEach(r => refs.push({ system: "LEY", ref: r }));
  const art = text.match(/\bArt(?:[íi]culo)?\s+\d+[^\n]*\b/gi);
  if (art) art.forEach(r => refs.push({ system: "ART", ref: r.trim() }));
  return refs;
}

function detectEffectiveDates(text) {
  const m = text.match(/\b(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})\b/gi);
  if (!m) return {};
  return { starts_at_text: m[0] };
}

function detectScope(text) {
  const s = [];
  if (/Canarias|Ceuta|Melilla/i.test(text)) s.push("territorial_exclusiones");
  if (/entregas de bienes|prestaciones de servicios/i.test(text)) s.push("hecho_imponible");
  if (/importaci[oó]n/i.test(text)) s.push("importaciones");
  return s;
}

function computeId(payload) {
  const h = crypto.createHash("sha256");
  h.update(JSON.stringify(payload));
  return h.digest("hex").slice(0, 16);
}

function buildExtraction(text, originPath) {
  const tax = detectTax(text);
  const intents = detectIntent(text);
  const rates = detectRates(text);
  const thresholds = detectThresholds(text);
  const refs = detectCitations(text);
  const effective = detectEffectiveDates(text);
  const scope = detectScope(text);
  const rule = {
    language: "es",
    jurisdiction: "ES",
    tax_code: tax.code,
    tax_name: tax.name,
    intents: intents,
    rates: rates,
    thresholds: thresholds,
    scope: scope,
    text_span: text.slice(0, 2000)
  };
  const payload = {
    source: {
      kind: originPath ? "file" : "stdin",
      file: originPath || null
    },
    references: refs,
    rule: rule,
    meta: {
      extractor_version: "11.1.0",
      extracted_at: new Date().toISOString(),
      confidence: rates.length > 0 ? 0.7 : 0.5
    }
  };
  const id = computeId(payload);
  return { id, ...payload };
}

function writeSidecar(json, originPath) {
  if (!originPath) return;
  const out = originPath.replace(/\.[^.]+$/, "") + ".extraction.json";
  fs.writeFileSync(out, JSON.stringify(json, null, 2), "utf8");
}

const args = process.argv.slice(2);
const originArg = args.find(a => !a.startsWith("--"));
const emitFile = args.includes("--write");
const text = loadTextFromArgOrStdin();
const extraction = buildExtraction(text, originArg || null);
if (emitFile && originArg) writeSidecar(extraction, originArg);
process.stdout.write(JSON.stringify(extraction, null, 2));
