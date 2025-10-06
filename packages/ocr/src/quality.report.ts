import { join } from "path";
import { writeFileSync } from "fs";
import { runSingle } from "./quality.table.js";

export type QualityRow = {
  fixture: string;
  RAW_tok: number;
  PRE_tok: number;
  RAW_chr: number;
  PRE_chr: number;
  RAW_recall: number;
  PRE_recall: number;
  BEST: "RAW" | "PRE";
};

export async function runFixtureQuality(outDir: string) {
  const fixtures = ["sample-a", "sample-b"];
  const rows: QualityRow[] = [];
  for (const f of fixtures) {
    const raw = await runSingle(f, { mode: "raw" });
    const pre = await runSingle(f, { mode: "stage", stage: "final" });
    rows.push({
      fixture: f,
      RAW_tok: raw.tokens,
      PRE_tok: pre.tokens,
      RAW_chr: raw.chars,
      PRE_chr: pre.chars,
      RAW_recall: raw.recall,
      PRE_recall: pre.recall,
      BEST: pre.recall >= raw.recall ? "PRE" : "RAW",
    });
  }
  const lines = [
    "fixture,RAW_tok,PRE_tok,RAW_chr,PRE_chr,RAW_recall,PRE_recall,BEST",
    ...rows.map(
      r =>
        `${r.fixture},${r.RAW_tok},${r.PRE_tok},${r.RAW_chr},${r.PRE_chr},${r.RAW_recall.toFixed(
          1
        )}%,${r.PRE_recall.toFixed(1)}%,${r.BEST}`
    ),
  ];
  writeFileSync(join(outDir, "quality.csv"), lines.join("\n"), "utf8");
  const md = [
    "| fixture | RAW_tok | PRE_tok | RAW_chr | PRE_chr | RAW_recall | PRE_recall | BEST |",
    "|---:|---:|---:|---:|---:|---:|---:|:---:|",
    ...rows.map(
      r =>
        `| ${r.fixture} | ${r.RAW_tok} | ${r.PRE_tok} | ${r.RAW_chr} | ${r.PRE_chr} | ${r.RAW_recall.toFixed(
          1
        )}% | ${r.PRE_recall.toFixed(1)}% | ${r.BEST} |`
    ),
  ].join("\n");
  writeFileSync(join(outDir, "quality.md"), md, "utf8");
  return { console: md };
}

export async function runFixtureQualityWithStages(outDir: string) {
  const fixtures = ["sample-a", "sample-b"];
  const rows: string[] = ["fixture,stage,tokens,chars,recall"];
  for (const f of fixtures) {
    const raw = await runSingle(f, { mode: "raw" });
    rows.push(`${f},RAW,${raw.tokens},${raw.chars},${raw.recall}`);
    const stages = ["deskew", "binarize", "invert", "blur"] as const;
    let last = raw;
    for (const s of stages) {
      last = await runSingle(f, { mode: "stage", stage: s });
      rows.push(`${f},${s},${last.tokens},${last.chars},${last.recall}`);
    }
  }
  writeFileSync(join(outDir, "stages.csv"), rows.join("\n"), "utf8");
}
