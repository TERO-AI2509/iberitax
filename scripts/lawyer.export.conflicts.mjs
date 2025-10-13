import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...rest] = a.split("=");
  return [k.replace(/^--/,""), rest.join("=")];
}));

const inputPath = args.in || "artifacts/modelo100/conflicts.json";
const logPath = args.log || "artifacts/modelo100/lawyer.review.log.jsonl";
const actor = args.who || "sistema";
const locale = "es-ES";

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function readLogLines(p) {
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
}

function writeAppend(p, lineObj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, JSON.stringify(lineObj) + "\n");
}

function stableSortById(items) {
  return [...items].sort((a, b) => {
    const A = String(a.id || "");
    const B = String(b.id || "");
    return A.localeCompare(B, "en");
  });
}

async function maybeSlack(text) {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
  } catch {}
}

if (!fs.existsSync(inputPath)) {
  console.error("Conflicts file not found:", inputPath);
  process.exit(1);
}

const conflicts = readJSON(inputPath);
if (!Array.isArray(conflicts)) {
  console.error("Conflicts input must be an array");
  process.exit(1);
}

const log = readLogLines(logPath);
const openById = new Set(log.filter(e => e.state === "open").map(e => e.id));
const now = new Date().toISOString();
const sorted = stableSortById(conflicts);
let seeded = 0;

for (const c of sorted) {
  const id = String(c.id || "");
  if (!id) continue;
  if (openById.has(id)) continue;
  const titulo = c.title_es || c.title || `Conflicto ${id}`;
  const detalle = c.detail_es || c.detail || "";
  const fuente = c.source || "";
  const entry = {
    ts: now,
    id,
    actor,
    action: "seed",
    state: "open",
    locale,
    message: `Nuevo conflicto para revisión: ${titulo}`,
    meta: {
      titulo,
      detalle,
      fuente,
      provenance: c.provenance ?? null
    }
  };
  writeAppend(logPath, entry);
  seeded++;
  await maybeSlack(`:rotating_light: Nuevo conflicto para revisión\nID: ${id}\nTítulo: ${titulo}\nEstado: open`);
}

console.log(JSON.stringify({ ok: true, logPath, seeded }));
