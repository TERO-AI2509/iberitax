import { readFileSync, writeFileSync } from "node:fs";
import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ChartJSNodeCanvas } from "chartjs-node-canvas";
import Chart from "chart.js/auto";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const ART = join(ROOT, "artifacts");
const DRIFT_DIR = join(ART, "drift");
const CHARTS_DIR = join(DRIFT_DIR, "charts");
if (!existsSync(DRIFT_DIR)) mkdirSync(DRIFT_DIR, { recursive: true });
if (!existsSync(CHARTS_DIR)) mkdirSync(CHARTS_DIR, { recursive: true });

const HISTORY_MD = join(ART, "validation_history.md");

function parseMarkdownTable(md) {
  const lines = md.split(/\r?\n/).filter(Boolean);
  const tableStart = lines.findIndex(l => /^\|/.test(l));
  if (tableStart === -1) return { headers: [], rows: [] };
  const header = lines[tableStart].split("|").map(s => s.trim()).filter(Boolean);
  const rows = [];
  for (let i = tableStart + 2; i < lines.length; i++) {
    if (!/^\|/.test(lines[i])) continue;
    const cols = lines[i].split("|").map(s => s.trim()).filter(Boolean);
    if (cols.length === header.length) rows.push(cols);
  }
  return { headers: header, rows };
}

function numeric(x) {
  if (x == null) return null;
  const m = String(x).match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function normalizeField(name) {
  return String(name || "").toLowerCase().replace(/\s+/g, "_");
}

async function makeLineChart({ labels, data, outPath, title }) {
  const width = 800;
  const height = 300;
  const canvas = new ChartJSNodeCanvas({ width, height, backgroundColour: "white" });
  const cfg = {
    type: "line",
    data: {
      labels,
      datasets: [{ label: title, data, fill: false, tension: 0.2 }]
    },
    options: {
      responsive: false,
      plugins: { legend: { display: false }, title: { display: true, text: title } },
      scales: { y: { beginAtZero: true, max: 100 } }
    }
  };
  const buf = await canvas.renderToBuffer(cfg);
  writeFileSync(outPath, buf);
}

function computeDrift(series) {
  if (!series || series.length < 2) return null;
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  if (last == null || prev == null) return null;
  return Number((last - prev).toFixed(2));
}

function safeRead(p) {
  try { return readFileSync(p, "utf8"); } catch { return null; }
}

async function main() {
  const md = safeRead(HISTORY_MD);
  if (!md) {
    const placeholder = [
      "# Field Drift",
      "",
      "_No validation_history.md found. Generated placeholder._",
      "",
      "| field | last_accuracy | prev_accuracy | drift |",
      "|---|---:|---:|---:|"
    ].join("\n");
    writeFileSync(join(DRIFT_DIR, "field_drift.md"), placeholder);
    console.log("No validation_history.md, wrote placeholder.");
    return;
  }

  const { headers, rows } = parseMarkdownTable(md);
  const h = headers.map(x => x.toLowerCase());
  const fieldIdx = h.findIndex(x => /field/.test(x));
  const accIdx = h.findIndex(x => /(accuracy|acc%)/.test(x));
  const runIdx = h.findIndex(x => /(run|date|timestamp)/.test(x));

  if (fieldIdx === -1 || accIdx === -1 || runIdx === -1) {
    const placeholder = [
      "# Field Drift",
      "",
      "_Could not detect required columns (need: field, accuracy, run/date). Generated placeholder._",
      "",
      "| field | last_accuracy | prev_accuracy | drift |",
      "|---|---:|---:|---:|"
    ].join("\n");
    writeFileSync(join(DRIFT_DIR, "field_drift.md"), placeholder);
    console.log("history table missing columns, wrote placeholder.");
    return;
  }

  const map = new Map();
  for (const r of rows) {
    const field = normalizeField(r[fieldIdx]);
    const acc = numeric(r[accIdx]);
    const run = r[runIdx];
    if (!map.has(field)) map.set(field, []);
    map.get(field).push({ run, acc });
  }

  for (const [k, arr] of map) {
    arr.sort((a, b) => String(a.run).localeCompare(String(b.run)));
  }

  const mdOut = [];
  mdOut.push("# Field Drift");
  mdOut.push("");
  mdOut.push("| field | last_accuracy | prev_accuracy | drift | chart |");
  mdOut.push("|---|---:|---:|---:|:--:|");

  const csvOut = [];
  csvOut.push(["field","run","accuracy"].join(","));

  for (const [field, series] of map) {
    const labels = series.map(s => s.run);
    const data = series.map(s => s.acc ?? null);

    for (const s of series) {
      csvOut.push([field, s.run, s.acc ?? ""].join(","));
    }

    const drift = computeDrift(data);
    const last = data.length ? data[data.length - 1] : null;
    const prev = data.length > 1 ? data[data.length - 2] : null;

    const png = join(CHARTS_DIR, `${field}.png`);
    if (data.filter(v => v != null).length >= 2) {
      await makeLineChart({
        labels,
        data,
        outPath: png,
        title: `${field} accuracy`
      });
    } else {
      writeFileSync(png, Buffer.from([]));
    }

    const chartRel = `charts/${field}.png`;
    mdOut.push(`| ${field} | ${last ?? ""} | ${prev ?? ""} | ${drift ?? ""} | ![](${chartRel}) |`);
  }

  writeFileSync(join(DRIFT_DIR, "field_drift.md"), mdOut.join("\n"));
  writeFileSync(join(DRIFT_DIR, "drift_amounts.csv"), csvOut.join("\n"));
  console.log("Drift artifacts written to artifacts/drift");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
