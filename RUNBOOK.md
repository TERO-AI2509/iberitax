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
