import fs from "node:fs";
import path from "node:path";

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...rest] = a.split("=");
  return [k.replace(/^--/,""), rest.join("=")];
}));

const id = args.id || "";
const action = args.action || "";
const actor = args.who || "desconocido";
const note = args.note || "";
const logPath = args.log || "artifacts/modelo100/lawyer.review.log.jsonl";
const locale = "es-ES";

const allowedActions = ["picked_up","answered","closed"];
const transitions = {
  open: "picked_up",
  picked_up: "answered",
  answered: "closed",
  closed: null
};

function readLogLines(p) {
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, "utf8").split("\n").filter(Boolean).map(l => JSON.parse(l));
}

function writeAppend(p, lineObj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.appendFileSync(p, JSON.stringify(lineObj) + "\n");
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

if (!id) {
  console.error("Missing --id");
  process.exit(1);
}
if (!allowedActions.includes(action)) {
  console.error("Invalid --action");
  process.exit(1);
}

const log = readLogLines(logPath);
const last = [...log].reverse().find(e => e.id === id);
const fromState = last ? last.state : null;

if (!fromState) {
  console.error("Unknown ID or no seed/open entry:", id);
  process.exit(1);
}

const expected = transitions[fromState];
if (expected !== action) {
  console.error("Invalid transition", { fromState, action, expected });
  process.exit(1);
}

const toState = action;
const now = new Date().toISOString();
const msgMap = {
  picked_up: "Caso recogido para revisión",
  answered: "Caso respondido",
  closed: "Caso cerrado"
};

const entry = {
  ts: now,
  id,
  actor,
  action,
  state: toState,
  locale,
  message: note ? `${msgMap[action]}: ${note}` : msgMap[action],
  meta: {}
};

writeAppend(logPath, entry);
await maybeSlack(`:memo: Actualización de conflicto\nID: ${id}\nAcción: ${action}\nEstado: ${toState}${note ? `\nNota: ${note}` : ""}`);
console.log(JSON.stringify({ ok: true, id, fromState, toState, logPath }));
