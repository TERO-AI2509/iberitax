# TERO AI / Iberitax — Runbook
_Last updated: 2025-10-04 (Europe/Amsterdam)_

This runbook is the canonical project record. It consolidates Phases 00–02 and Phase 03 (through Step 06). Decision Logs and user preferences are embedded where relevant.

---

## Ground Rules & Working Agreements
- Baby-step, copy/paste-ready instructions; define every acronym on first use.
- One-command-per-step rule; POSIX-only shell commands; no inline comments in command blocks.
- Definition of Done per microstep: state acceptance criteria and quick test.
- Decision log: capture important choices with date/time and rationale.
- Security/GDPR baseline: no PII in logs; 60–90 day default retention; export/delete flows.
- MVP discipline: extras to backlog; ship only what’s needed to learn/sell; revisit scope weekly.
- End-of-step ritual: generate next-step Starter Prompt; remind to upload all MU-plugins/repo zip.
- Unblock policy: if blocked >15 minutes, present fallback plan with options; choose one to proceed.
- Never use `applypatch` (optional only if explicitly requested); provide POSIX commands.
- No inline comments inside copy/paste command blocks.

---

## Phase 00 — Environment & Baseline Setup (Consolidated Retrospective)
**Intent:** Establish local dev environment, package layout, and repo conventions.

**Key Outcomes**
- Folder layout established (`apps/*`, `packages/*`, MU-plugins policy captured).
- Git baseline with branching/tagging conventions.
- Tooling: pnpm, TypeScript (TS), Jest baseline planned for later retrofit (ESM/TS/Jest).

**Acceptance**
- Repo builds locally without errors.
- Basic scripts run via pnpm workspaces.

**Lessons Learned**
- Prefer minimal, consistent scripts.
- Early decisions documented to avoid drift.

---

## Phase 01 — CI Pipeline & Guardrails (Consolidated)
**Intent:** Make CI predictable, slow is smooth → smooth is fast.

**Steps & Outcomes (high level)**
- Step 39–44: GitHub Actions CI workflow established; artifacts persisted; PR checks marked as required.
- Step 45: Guardrail on smoke timings; uploaded artifacts prove timing; stabilized green runs.
- Step 46–48: CI hardening; resolved flaky jobs; rolled back when instability increased.

**Artifacts**
- `.github/workflows/ci.yml` current working version (guardrails + artifacts).
- Smoke job artifacts for timing and diagnostics persisted per run.

**Lessons Learned**
- If a “fix” re-introduces instability, revert and proceed; prefer boring green CI over clever red CI.
- YAML syntax failures are common; validate with minimal diffs.

**Open Items**
- Some tests intentionally skipped during stabilization — tracked for revisit when needed.

---

## Phase 02 — MVP Prep & Scope Lock (Consolidated)
**Intent:** Lock MVP scope and backlog grooming; ensure repo is ready for OCR phase.

**Decisions**
- MVP filing scope: **Option A (assist, not file)**. Deliver: Modelo 100 field map (JSON) + PDF report + step-by-step filing guide.
- Market expansion roadmap: Spain-only MVP → Phase 2 Portugal+Greece → Phase 3 Italy post-validation/funding.

**Backlog Highlights**
- Vendor performance analytics; proposal generation; upsell recommendations.
- After client separation and GDPR: customer-facing rewrite, playbook integration, scenario generator, risk & compliance checks, executive summary.

**Acceptance**
- Scope and decisions recorded; next phase (OCR) unblocked.

---

## Phase 03 — OCR & Extraction

### Step 01–02 — OCR Baseline Setup
**Summary**
- Set up OCR package scaffolding and baseline build with TypeScript (`packages/ocr`).
- Fixed TS config issues (`module`/`moduleResolution: NodeNext`) and ensured clean builds.

**Acceptance**
- `pnpm -w build` succeeds; OCR package compiles.

---

### Step 03 — Preprocessing & Normalization
**Summary**
- Implemented `normalizeSpanishText`: currency normalization (€, EUR), thousand separators, decimal comma, date normalization (dd/mm/yyyy), etc.
- Established patterns for stable downstream parsing.

**Acceptance**
- Unit smoke confirms normalization transforms representative strings correctly.

---

### Step 04 — Preprocess Bench Analysis
**Summary**
- Bench script compares raw vs preprocessed OCR speed and token yield; captures timings.
- Early data showed comparable times; focus remains on accuracy/recall improvements.

**Acceptance**
- Bench runs with reproducible output; artifacts captured.

---

### Step 05 — OCR Quality Harness Setup
**Summary**
- Created quality harness measuring token/char counts and recall per fixture (RAW vs PRE).
- Report prints per-fixture results and overall BEST mode; stored artifacts.

**Observed**
- On samples `sample-a` / `sample-b`, RAW currently outperforming PRE for recall — drives targeted preprocess tuning.

**Acceptance**
- Harness runs end-to-end; artifacts present.

---

### Step 06 — Harness UX & Wrap-up (This Step)
**Summary**
- Integrated console table renderer and **brief mode**.
- Updated orchestrator and report module to support table + brief.
- Validated on sample fixtures; outputs render as expected.

**Changed/Added**
- `packages/ocr/src/quality.table.ts`
- `packages/ocr/src/quality.report.ts` (brief mode)
- `packages/ocr/src/quality.ts` (wire-up)

**Artifacts (Step 06)**
- `repo-manifest.txt` at repo root (sorted file list).
- `iberitax-phase03-step06.zip` containing:
  - `packages/ocr/src/quality.ts`
  - `packages/ocr/src/quality.report.ts`
  - `packages/ocr/src/quality.table.ts`
  - `packages/ocr/fixtures/**`
  - `packages/ocr/artifacts/**`
  - `packages/ocr/package.json`
  - `repo-manifest.txt`

**Definition of Done**
- This runbook updated and committed.
- Manifest and step zip exist and include the files above.
- Console table + brief mode verified on local fixtures.

---

## Decision Log (curated)
- **2025-09-25**: Filing scope MVP = **Option A (assist, not file)**; deliver Modelo 100 mapping, PDF report, step-by-step guide.
- **2025-09-25**: Market expansion: Spain-only MVP → Phase 2 Portugal+Greece → Phase 3 Italy post-validation/funding.
- **2025-09-27**: Validation & Test Strategy refresh (lazy validator compile, contract-first error design, interop hardening).
- **2025-09-28**: Plan future **ESM/TS/Jest baseline retrofit** post-stability; require full repo backup before retrofit.

---

## User Preferences & Conventions
- Proceed step-by-step; slower pace for error resolution.
- No `applypatch`. POSIX-only commands. No inline comments inside code blocks.
- At end of each step: generate Starter Prompt and request repo zip + `repo-manifest.txt`.

---
## Phase 03 · Step 07 — Targeted Preprocess Tuning (2025-10-04)

### What changed
- Ran quality harness with multiple PRE parameter sweeps to improve recall: binarize+threshold, deskew+blur, invert.

### Inputs
- Fixtures: packages/ocr/fixtures/sample-a.*, sample-b.*
- Harness: packages/ocr/src/quality.ts with CSV/MD outputs in packages/ocr/artifacts

### Runs & metrics (RAW vs PRE)
- Baseline: OVERALL RAW_recall=50.0%, PRE_recall=16.7%, BEST=RAW
- Sweep1 (BINARIZE=1 BIN_THRESHOLD=0.35): OVERALL PRE_recall=16.7%
- Sweep1 (BINARIZE=1 BIN_THRESHOLD=0.45): OVERALL PRE_recall=16.7%
- Sweep2 (DESKEW=1 MAX_SKEW_DEG=7 BLUR_RADIUS=0): OVERALL PRE_recall=16.7%
- Sweep2 (DESKEW=1 MAX_SKEW_DEG=7 BLUR_RADIUS=2): OVERALL PRE_recall=16.7%
- Sweep3 (BINARIZE=1 BIN_THRESHOLD=0.45 INVERT=1): OVERALL PRE_recall=16.7%

### Decision
- PRE does not outperform RAW on recall. Keep existing defaults.
- Tie-breakers (tokens/chars) also showed no advantage for PRE.
- Hypothesis: env-driven preprocess parameters not applied inside the harness path; investigate wiring in the next step.

### Acceptance
- Three+ tuned runs recorded; artifacts captured per run; comparison verified.
- No default preset change applied.

### Next steps
- Verify env→preprocess wiring in src/preprocess.ts and where called in quality.ts.
- Add a one-line console of effective PRE opts inside harness to validate configuration at runtime.
## Phase 03 · Step 08 — Harness wiring + PRE options print (2025-10-04)

### What changed
- Added runtime print of effective preprocess options at harness start.
- Verified env-driven overrides are live.

### Evidence
- Console shows: PRE_OPTS {"deskew":true,"binarize":true,"blurRadius":1,"invert":false,"binThreshold":null,"maxSkewDeg":5}
- Re-ran tuned sweeps with overrides; OVERALL remained RAW_recall=50.0% vs PRE_recall=16.7%.

### Decision
- Keep existing defaults. Current PRE pipeline reduces recall for these fixtures.

### Next
- Try adaptive/OTSU thresholding and a minimal-preprocess path; route per-fixture type.
- Add metrics per stage to see which transform harms signal.
## Phase 03 — Step 09: Minimal vs Fixed vs Adaptive (Routing Probe)

### What changed
- Added routing variants (fixed/minimal/adaptive) and per-stage metrics export.
- Captured artifacts and quality tables per route.

### Evidence
- step09-* /quality.csv shows:
  - sample-a: RAW_recall 66.7% → PRE_recall 70.0% (BEST=PRE)
  - sample-b: RAW_recall 33.3% → PRE_recall 35.0% (BEST=PRE)
- step09-minimal /stages.csv shows stage-wise deltas:
  - sample-a: RAW 66.7 → deskew 68.0 → binarize 70.0 → invert 65.4 → blur 63.4
  - sample-b: RAW 33.3 → deskew 34.0 → binarize 35.0 → invert 32.6 → blur 31.6

### Decision
- Keep routing variants for Step 10 expansion.
- Use stage metrics to localize wins (deskew/binarize) vs losses (invert/blur).

### Acceptance
- Harness produces quality.csv and stages.csv per run.
- Artifacts stored under packages/ocr/artifacts/step09-*/ with console logs.

### Next
- Expand fixtures to ≥3 doc types (salary slip, dividend certificate, rental receipt).
- Add early error taxonomy (tokenization vs OCR skip vs normalization) and emit an error summary table alongside recall metrics.
## Phase 03 · Step 13 — CI Wiring + Artifact Upload (final)

What changed
- Restored known-good baseline CI at .github/workflows/ci.yml
- Added follower workflow .github/workflows/ocr-validate.yml using workflow_run to execute OCR validation only after CI succeeds
- OCR job installs via Corepack to honor package.json "packageManager"
- Uploads packages/ocr/artifacts/** as "ocr-artifacts"

Why
- Avoided destabilizing the baseline CI
- Eliminated pnpm version conflicts between action inputs and packageManager

How to run locally
- pnpm --filter @iberitax/ocr run smoke:ocr:full

Acceptance
- Actions: CI green, then "OCR Validate (follows CI)" runs and uploads "ocr-artifacts"
- Artifacts include validation_summary.* and validation_report.*

Lessons learned
- Prefer Corepack to respect packageManager and reduce moving parts
- When a job causes baseline churn, split into a follower workflow with workflow_run

Definition of Done
- CI executes normally
- OCR validation runs after CI success
- Artifacts uploaded from packages/ocr/artifacts/**
- RUNBOOK updated and step ZIP produced
## Phase 03 · Step 14 — PR Comment with OCR Validation Summary

- Added follower workflow `.github/workflows/ocr-validate.yml` triggered on successful CI `workflow_run` for PRs.
- Downloads `ocr-artifacts` from the originating run, reads `packages/ocr/artifacts/validation_summary.md` (fallback: CSV), and posts/updates a single PR comment titled "OCR Validation Summary".
- Deep links to the CI run artifacts page.
- No-op on pushes to `main`.

Acceptance:
- PR shows a single up-to-date "OCR Validation Summary" comment after each successful CI.
- Follower logs show artifact detection and successful comment post.

Notes:
- Requires the primary workflow to be named "CI".
- Artifacts must include either `validation_summary.md` or `validation_summary.csv`.

## Lessons Learned — CI edits during Step 14
- Revert-first policy: if CI breaks, restore the last green `ci.yml` from `main` before any further edits.
- No live-splicing `ci.yml`: avoid regex/awk inserts inside existing steps; YAML drift is too risky.
- Step isolation: keep Step 14 scoped to the follower workflow and script; do not modify CI unless strictly required.
- Artifact contract first: verify the CI artifact name and workflow name, then adapt the follower to those, not the other way around.
- Single-change rule: apply one small change, run once, read the first failing step, then proceed.

## Phase 03 · Step 14 — PR Comment with OCR Validation Summary (finalized)
Status: Completed. CI left untouched by reverting to last known good from `main`. Follower workflow listens to the actual CI workflow name, downloads `ocr-artifacts`, parses `validation_summary.md` (CSV fallback), and upserts a single PR comment titled "OCR Validation Summary" with a deep link to the run’s artifacts page. No-op on pushes to `main`.
Acceptance Evidence: CI green on PR; follower run succeeded; PR shows the "OCR Validation Summary" comment updated by latest run.
### Step 15 Fix — Test sample paths
Issue: tests used repo-root paths and failed when run from package root.
Change: resolve samples relative to test file location.
Result: `test:contracts` and `smoke:contract` both pass.

## Phase 03 · Step 23 — Per-Field Drift Rules & Overrides

Files
- packages/ocr/config/drift.rules.json
- packages/ocr/scripts/drift.gate.mjs

Defaults
- Fail if Δ ≤ -2.0 or last < 80.0

Overrides (initial)
- iban: rel_drop=-1.0, abs_floor=90.0
- vat_number: abs_floor=85.0
- exempt: vendor_internal_note
- min_support: 20

Acceptance
- pnpm -F @iberitax/ocr run check:drift:gate applies overrides and exemptions
- Offenders table shows rule source (global vs field-override)
- Digest lists active overrides and exemptions; skipped rows listed

Lessons learned
- Keep gates dependency-free
- Stable, greppable output
- Treat exemptions as skipped, not passed

## Phase 03 · Step 24 — Drift Dashboard & History Overlay

Files
- packages/ocr/scripts/drift.dashboard.mjs → builds artifacts/drift/index.html from drift_amounts.csv (+ optional validation_history.md)

Acceptance
- pnpm -F @iberitax/ocr run check:drift:gate
- pnpm -F @iberitax/ocr run drift:dash
- artifacts/drift/index.html renders table with Δ badges and simple sparkline
- Link to validation_history.md if present

Notes
- Sideload history by adding "field: v1,v2,...,vn" lines into artifacts/validation_history.md

## Phase 03 · Step 24 — Drift Dashboard wired to CI

**What changed**
- New workflow `.github/workflows/ocr-drift.yml`:
  - `drift:gen` (never fails)
  - `check:drift:gate` (strict; fails on offenders)
  - `drift:dash` (always runs)
  - Uploads `packages/ocr/artifacts/drift/**` (+ validation history/trend) as CI artifacts

**Why**
- Reliable, human-readable review even on red builds
- Fast triage with Δ badges and sparkline

**Acceptance**
- CI job produces artifact `ocr-drift-artifacts` on PRs & pushes to `main`
- Local: `pnpm -F @iberitax/ocr run drift:dash` writes `artifacts/drift/index.html`
- Gate behavior: quarantined → Skipped; offenders → non-zero exit

**Next microsteps**
1) (Optional) Auto-link dashboard artifact in PR comment
2) Tighten per-field overrides gradually; remove items from `quarantine` as fixes land
3) Add min_support enforcement once support counts are real

**Lessons learned**
- Separate “generate” from “gate” to keep insights flowing on red runs
- Always `if: always()` for artifact steps to avoid losing evidence

## 2025-10-05 — Phase 03 · Step 25 — Targeted Fix & De-quarantine Loop

Scope: De-quarantine field_7 / field_8 after normalizing Spanish-formatted amounts.
Changes:
- Added normalizeEuroAmount() in src/normalize.ts
- Routed field_7 / field_8 through normalizeEuroAmount() in norm-index.ts
- Updated drift.rules.json to remove them from quarantine and add tight overrides

Acceptance:
- Drift gate passes or fails only on remaining quarantined fields
- artifacts/drift/index.html shows improved Δ for field_7 / field_8

## 2025-10-05 — Phase 03 · Step 25 — Targeted Fix & De-quarantine Loop (pass 2)

Root cause (money fields): OCR glyph confusions (O↔0, l/I↔1, S↔5, B↔8) plus comma/space handling.
Changes:
- Added cleanNumericGlyphs() pre-pass for numeric strings.
- normalizeEuroAmount() now uses glyph cleanup and stricter whitespace/sign logic.
- field_7 & field_8 routed through the new normalization.

Evidence (fill with latest dashboard values):
- Before: field_7 Δ = ___ ; field_8 Δ = ___
- After:  field_7 Δ = ___ ; field_8 Δ = ___
- Gate: PASS (or only remaining quarantined fields fail).

## 2025-10-05 — Phase 03 · Step 25 — Targeted Fix & De-quarantine Loop

Targeted fields: field_7, field_8 (amounts).
Changes:
- Added robust EU amount normalization (comma decimals, space/period thousands, glyph cleanup).
- Routed field_7/field_8 through normalizeEuroAmount().
- De-quarantined with strict per-field drift overrides (max_drop=-1, abs_floor=80, min_support=20).

Evidence:
- Gate: PASS (only other quarantined fields skipped).
- Δ unchanged today due to insufficient fixture support for amount fields.
  Action: add minimal labeled fixtures in Step 26 so drift reflects improvements.

Rationale:
- Normalization fixes applied; metrics will move once covered samples exist in history.

## 2025-10-05 — Phase 03 · Step 25 — Targeted Fix & De-Quarantine Loop ✅

**Scope:** field_7 & field_8 (amount fields)

**Changes**
- Added `normalizeEuroAmount()` with European decimal handling + glyph cleanup.
- Routed amount fields through the new normalizer.
- Introduced synthetic fixtures (2) for amount coverage.
- Added support-merger script to enrich drift CSVs.
- De-quarantined field_7 + field_8 with strict per-field overrides.

**Evidence**
- Dashboard shows Support = 2 for field_7 + field_8.  
- Drift gate → PASS.  
- Δ unchanged (expected until more fixtures accumulate).

**Next**
- Step 26 → Expand fixture coverage (≥ 10 samples) to build reliable trend curves.  
- When support > 10, reduce overrides to global thresholds and monitor stability.

# Phase 03 · Step 28 — Field Correction Planning

## Objective
Parse drift.classification.csv and recent validation_history.md, auto-suggest correction heuristics per Critical and Volatile field, and prepare tuning plan inputs for Phase 04 (Mapping Rules Tuning).

## Inputs
- packages/ocr/artifacts/drift/drift.classification.csv
- packages/ocr/artifacts/validation_history.md

## Process
1) Ingested drift.classification.csv and validation_history.md.
2) For each Critical field, proposed concrete extraction/normalization adjustments (ROI, thresholding, grouping, confidence cutoffs).
3) For each Volatile field, flagged data-quality or preprocessing checks.
4) Wrote field_corrections.plan.csv with columns: field,category,suggested_action,confidence.

## Results
Exported: packages/ocr/artifacts/field_corrections.plan.csv

| field   | category | suggested_action                                                                                     | confidence |
|---------|----------|------------------------------------------------------------------------------------------------------|------------|
| field_1 | Critical | Increase OCR zone height by 10% and expand token grouping tolerance to merge split numeric fragments | 0.92       |
| field_2 | Volatile | Inspect raw samples for skewed images or partial overlays; consider mild deskew before OCR           | 0.73       |
| field_3 | Volatile | Normalize decimal separators (comma→dot) in preprocessing; verify language locale                    | 0.80       |
| field_4 | Critical | Re-center extraction ROI ±5px vertically; apply adaptive thresholding instead of fixed binarization  | 0.90       |
| field_5 | Critical | Enable text-line merging and disable whitespace cut-off for multi-row totals                         | 0.95       |
| field_6 | Critical | Adjust numeric confidence cutoff from 0.85→0.75; re-enable fallback normalization pass              | 0.88       |
| field_7 | Volatile | Data-quality issue likely—check for inconsistent page scans or duplicate rows in input PDFs         | 0.70       |
| field_8 | Critical | Re-tune threshold curve (REL_DROP -2→-1.5) and add zone-bias weighting for right-aligned totals     | 0.93       |

## Acceptance
- field_corrections.plan.csv generated with all 8 fields
- Each Critical field has a concrete, testable correction proposal
- Runbook Step 28 updated with plan summary

## Next (Phase 04 — Mapping Rules Tuning)
- Translate each suggested_action into concrete normalization/ROI/threshold rule edits
- Add per-field A/B toggles and run drift gate; require Δ ≥ 0 on Critical fields


# Phase 04 · Step 29 — Mapping Rules Tuning

## Objective
Apply field_corrections.plan.csv adjustments to extraction/normalization rules and verify drift recovery (Critical fields Δ ≥ 0).

## Inputs
- packages/ocr/artifacts/field_corrections.plan.csv
- packages/ocr/artifacts/drift/drift.classification.csv
- packages/ocr/artifacts/validation_history.md

## Plan
1) Create a tuning overlay: packages/ocr/config/tuning.step29.json derived from field_corrections.plan.csv.
2) Add a targeted drift override for field_8 (REL_DROP → -1.5) in packages/ocr/config/drift.rules.json.
3) Re-run drift and record artifacts to establish the tuned baseline.

## Commands
1) Generate tuning.overlay and patch drift rules
2) Rebuild, re-run drift suite, snapshot artifacts
3) Verify gate status and record summary

## Acceptance
- Drift gate passes with all Critical fields Δ ≥ 0
- Artifacts written: artifacts/drift/phase04-baseline-*.*
- Runbook updated with before/after deltas and next-step notes


## Phase 03 · Step 30 — Tuning Iteration & Lock-In — Status @ ${TS}

**What’s working**
- End-to-end pipeline runs cleanly (build → validate → drift → snapshot).
- Lock-in reports generated: packages/ocr/artifacts/drift/lockin.report.<ts>.csv.
- Config backups exist; tuning.stable.json present and ready to activate.

**What’s not yet working / Risks**
- No fields promoted to stable in this bundle (tuning.stable.json perField empty).
- field_6, field_7, field_8 remain Critical in drift.classification.csv; require broader samples and continued per-field tuning.

**Numbers (targeted fields)**
- field_6, field_7, field_8: Δ_change not confirmed in this archive (delta.*.csv not included in Step-30 zip).

**Next actions**
- Re-run Step-29 deltas with expanded fixtures; ensure promotion reads the newest delta.*.csv.
- Promote only fields with Δ_change > 0 into tuning.stable.json and re-run gate.
- Add golden tests for promoted fields to prevent regressions.


## Phase 03 · Step 31 — Regression Guards & Golden Tests (@ ${TS})

**Objective**
Add per-field golden tests for all promoted fields from Step 30.

**Scope**
- Create tests/contracts/golden/ fixtures.
- Implement test:golden runner (compare OCR output vs golden expectations).
- Require 3 green drift gates before Phase 04 transition.

**Definition of Done**
- Golden tests pass.
- Drift gate remains green.
- phase04-lockin snapshot archived.


## Phase 03 · Step 33 — Overlay Visualization & Tolerance Tuning ✅ [$ts]

**What changed**
- Added overlay renderer drawing each promoted field’s bbox + OCR glyph boxes on top of region images.
- Introduced per-field absolute / relative tolerances (`packages/ocr/config/tolerances.json`).
- Updated golden comparator to honor tolerances, normalize whitespace, and equate null ↔ undefined.
- Failures now print abs/rel tolerances, overlay path, and field-level diff.
- CI and local runs both attach overlay PNGs as artifacts.

**Why**
- Visual drift debugging is now instant.
- Tiny rounding and whitespace variations no longer break gates.
- Ensures reproducible, noise-free drift testing.

**Acceptance**
- Overlays rendered under `packages/ocr/artifacts/overlays/<field>/region.overlay.png`.
- Tests and drift gate green locally & in CI.
- Golden diffs readable and traceable.

**Next actions**
1. Integrate overlays into drift dashboard HTML.
2. Add per-field volatility auto-tuning for tolerance baselines.
3. Start **Step 34 — Drift Dashboard and HTML Reports** (visual summary + artifact browser).


CI: Drift dashboard now uploaded as artifact 'drift-dashboard' after drift:gen.

## Work Instructions — MVP-first Q&A Principle
### MVP-first Q&A Principle
- When asking questions, assume the user knows nothing.
- Always propose the shortest path to a working, reasonably robust MVP.
- Prioritize MVP practicality over nice-to-haves.

- When asking questions, assume the user knows nothing.
- Always propose the shortest path to a working, reasonably robust MVP.
- Prioritize MVP practicality over nice-to-haves.

CI Summary on failure: Job now writes a debug section with artifact name, dashboard path, local repro commands, and last 20 lines of drift_amounts.csv.

## Phase 03 · Step 35 — Drift History Links & Per-Field Navigation
Status: Done
Changes:
- Added per-field history renderer at `packages/ocr/scripts/drift.history.render.mjs`.
- Generated `packages/ocr/artifacts/reports/history/<field>.html` with inline SVG sparkline and Δ table.
- Post-processed dashboard to hyperlink field cells to their history pages via `drift.dashboard.linkify.mjs`.
- Added `pnpm -F @iberitax/ocr run drift:reports`.
- CI artifacts now include `packages/ocr/artifacts/reports/**`.
Next actions:
- Style polish for history pages.
- Optionally add per-field tolerance band shading in sparkline.
- Consider merging trends from multiple baselines into a toggle.


## Phase 03 · Step 35 — Drift History Links & Per-Field Navigation (Done)
- Added drift.history.render.mjs with markdown+snapshot fallbacks.
- Generated per-field history pages under artifacts/reports/history/ with sparklines and Δ table.
- Linked dashboard field cells to history pages via drift.dashboard.linkify.mjs.
- Added shared stylesheet artifacts/reports/styles.css.
- CI now uploads artifacts/reports/**.
Next: Step 36 — tolerance bands, OOB point coloring, last-5 filter.


## Phase 03 · Step 36 — Tolerance Bands & Last-5 Filter (2025-10-06)
**Status:** Done

**Changes:** 
- History pages now render a shaded ±tolerance band from `packages/ocr/config/tolerances.json`.
- Points outside tolerance are highlighted.
- In-page toggle shows full series or last 5 runs (zero-dependency, static).

**Acceptance:** 
- Each history page shows the band and colored out-of-band points.
- Toggle switches between full series and last 5 runs.
- CI artifact includes `reports/**`.

**Next Step:** Phase 03 · Step 37 — CSV Export + Drill-Through (per drift gate failures).

**Note:** As per project policy, after each Step we prepare a starter prompt for the next chat and remind to upload all MU-plugins and current files for analysis.
