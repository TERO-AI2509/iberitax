import { applyRules } from "./ai.apply.rules.mjs";
import fs from "fs";
function assertEqual(a, b, path = "") {
  const ta = typeof a;
  const tb = typeof b;
  if (ta !== tb) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!assertEqual(a[i], b[i], path + "[" + i + "]")) return false;
    return true;
  }
  if (ta === "object") {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (!assertEqual(ka, kb, path)) return false;
    for (const k of ka) if (!assertEqual(a[k], b[k], path + "." + k)) return false;
    return true;
  }
  return a === b;
}
const samples = [
  {
    name: "authority_overrides",
    context: { taxpayer_country: "ES", tax_event_date: "2024-06-30", income_type: "capital_gains" },
    rules: [
      {
        id: "G-2024-01",
        authority: "guidance",
        clarity_score: 60,
        effective_from: "2024-01-01",
        effective_to: null,
        retroactive_to: null,
        conditions: [{ path: "income_type", op: "==", value: "capital_gains" }],
        provenance: { url: "https://example.es/guidance/2024-01" },
        text: "Guidance on capital gains"
      },
      {
        id: "L-2024-10",
        authority: "statute",
        clarity_score: 40,
        effective_from: "2024-05-01",
        effective_to: null,
        retroactive_to: "2024-01-01",
        conditions: [{ path: "income_type", op: "==", value: "capital_gains" }],
        provenance: { url: "https://boe.es/ley/2024-10" },
        text: "Statutory rule on capital gains"
      }
    ],
    expect: (out) => {
      if (out.applied_rules.length !== 1) return false;
      const appliedId = out.applied_rules[0].rule.id;
      if (appliedId !== "L-2024-10") return false;
      if (out.conflicts.length !== 1) return false;
      if (out.conflicts[0].status !== "Interesting reading") return false;
      if (!out.conflicts[0].reasons.includes("higher_authority")) return false;
      return true;
    }
  },
  {
    name: "clarity_breaks_tie",
    context: { taxpayer_country: "ES", tax_event_date: "2025-02-15", income_type: "employment" },
    rules: [
      {
        id: "R-2025-A",
        authority: "regulation",
        clarity_score: 70,
        effective_from: "2025-01-01",
        conditions: [{ path: "income_type", op: "==", value: "employment" }],
        provenance: { url: "https://example.es/reg/2025-A" },
        text: "Clearer regulation"
      },
      {
        id: "R-2024-B",
        authority: "regulation",
        clarity_score: 55,
        effective_from: "2025-01-01",
        conditions: [{ path: "income_type", op: "==", value: "employment" }],
        provenance: { url: "https://example.es/reg/2024-B" },
        text: "Less clear regulation"
      }
    ],
    expect: (out) => {
      if (out.applied_rules[0].rule.id !== "R-2025-A") return false;
      if (!out.conflicts[0].reasons.includes("greater_clarity")) return false;
      return true;
    }
  },
  {
    name: "recency_after_equal_authority_and_clarity",
    context: { taxpayer_country: "ES", period_end: "2023-12-31", income_type: "dividends" },
    rules: [
      {
        id: "C-2023-01",
        authority: "circular",
        clarity_score: 50,
        effective_from: "2023-01-01",
        conditions: [{ path: "income_type", op: "==", value: "dividends" }],
        provenance: { url: "https://example.es/circ/2023-01" },
        text: "Old circular"
      },
      {
        id: "C-2024-01",
        authority: "circular",
        clarity_score: 50,
        effective_from: "2024-01-01",
        retroactive_to: "2023-07-01",
        conditions: [{ path: "income_type", op: "==", value: "dividends" }],
        provenance: { url: "https://example.es/circ/2024-01" },
        text: "New circular retroactive"
      }
    ],
    expect: (out) => {
      if (out.applied_rules[0].rule.id !== "C-2024-01") return false;
      if (!out.conflicts[0].reasons.includes("more_recent")) return false;
      return true;
    }
  },
  {
    name: "temporal_and_condition_filters",
    context: { taxpayer_country: "ES", tax_event_date: "2022-03-01", income_type: "rent" },
    rules: [
      {
        id: "S-2021-07",
        authority: "statute",
        clarity_score: 80,
        effective_from: "2021-01-01",
        effective_to: "2021-12-31",
        conditions: [{ path: "income_type", op: "==", value: "rent" }],
        provenance: { url: "https://example.es/ley/2021-07" },
        text: "Expired statute"
      },
      {
        id: "S-2022-01",
        authority: "statute",
        clarity_score: 70,
        effective_from: "2022-01-01",
        conditions: [{ path: "income_type", op: "==", value: "rent" }],
        provenance: { url: "https://example.es/ley/2022-01" },
        text: "Current statute"
      },
      {
        id: "G-2022-R",
        authority: "guidance",
        clarity_score: 90,
        effective_from: "2022-01-01",
        conditions: [{ path: "income_type", op: "==", value: "royalties" }],
        provenance: { url: "https://example.es/guidance/2022-R" },
        text: "Different income type"
      }
    ],
    expect: (out) => {
      if (out.applied_rules[0].rule.id !== "S-2022-01") return false;
      const ignoredReasons = out.ignored_rules.map(x => x.reason).sort().join(",");
      if (ignoredReasons !== "condition_mismatch,temporal_mismatch") return false;
      return true;
    }
  }
];
let failures = [];
for (const s of samples) {
  const out = applyRules({ rules: s.rules, context: s.context });
  const ok = s.expect(out);
  if (!ok) failures.push(s.name);
}
if (failures.length === 0) {
  console.log("OK 11.5.application");
  process.exit(0);
} else {
  console.error("Failed samples: " + failures.join(", "));
  fs.writeFileSync("artifacts/11.5.last-output.json", JSON.stringify({ failures }, null, 2));
  process.exit(1);
}
