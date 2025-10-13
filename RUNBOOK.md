## 2025-10-06 — Phase 03 · Step 43 — Baseline Writeback & Exemption Cleanup

Status: Done

What changed
- Added baseline store at `packages/ocr/config/baseline.store.json` with `perField[field].{value,ts,actor,prev[]}`.
- Promotion now writes `suggested_baseline` to the store, removes the field from `rules.exempt`, regenerates drift artifacts, and links a **Baseline updates** page with per-field diffs.
- `DRY_RUN=1` previews changes without writing.

Why
- Replace exemption-based “green” with a durable, auditable baseline; keep the CI gate honest.

Acceptance (passed)
- Promoted fields persisted with `ts/actor`; removed from `rules.exempt`; gate remained green without exemptions; dashboard shows “Baseline updates” with last-updated + diff links.

Quick test
- Preview: `DRY_RUN=1 BASELINE_ACTOR="you" node packages/ocr/scripts/drift.baseline.promote.mjs --all`
- Apply: `BASELINE_ACTOR="you" node packages/ocr/scripts/drift.baseline.promote.mjs --all`
- Gate: `pnpm -F @iberitax/ocr run check:drift:gate`

Artifacts
- Store: `packages/ocr/config/baseline.store.json`
- Diffs: `packages/ocr/artifacts/reports/baseline/`
- Dashboard: `packages/ocr/artifacts/reports/drift-dashboard.html`

Phase 03 progress (snapshot)
- Drift math, trends, tolerances — ✅
- Reports & dashboard — ✅
- Alerts & recovery suggestions — ✅
- Baseline writeback (no exemptions) — ✅
- Governance & rollback UX — ⏳ (Step 44)
- Broader field maps & goldens growth — ⏳
- Vendor/reporting tie-ins — later phase


## 2025-10-06 — Phase 03 · Step 45 (CI Approval Integration & Audit Viewer) — Summary

Changes
- Workflow `.github/workflows/ocr-baseline-approval.yml` to run Approve/Revert with inputs and re-run the drift gate.
- CI summary script `.github/scripts/ocr-summary.baseline.mjs` adds ready-to-run hints to the job summary.
- Audit Viewer `packages/ocr/scripts/baseline.audit.viewer.mjs` generates `artifacts/reports/baseline/audit.html`.

Acceptance
- Actions → OCR Baseline Approval → action=approve, field=amount, actor=you completes green and uploads artifacts.
- `pnpm -F @iberitax/ocr run audit:gen` regenerates a populated audit table when entries exist.

Runbook Update — 2025-10-08
Phase 04 · Step 31 — Unified Audit Export (CSV)
✅ Completed: working CSV export + restored fields view.
Notes: History export functional; CSV naming verified; next = Mirror to Disk endpoint (Step 32).
### Phase 04 · Step 36 — Wire Route + Minimal Auth Gate
Date: '"$(date "+%Y-%m-%d %H:%M:%S %Z")"'
- Added /api/download-url with minimal header gate.
- Env: REQUIRE_DEV_KEY=1, DEV_KEY set; dotenv ensures .env is loaded.
- Verified: 401 without header; ok:true with X-Dev-Key.
## Phase 04 · Step 37 — Wire Download Button (UI → /api/download-url)
**When:** 2025-10-09T09:13:21Z
**Objective** Add a “Download original file” button calling /api/download-url and triggering a browser download; include X-Dev-Key when dev auth is enabled.
**Changes** packages/ocr/review/index.html: added Download button, fetchWithDevKey, toast, and click handler that opens returned url.
**Verification** Browser: set localStorage.DEV_KEY='dev-secret' if dev auth enabled; click Download. cURL: /api/health is ok; /api/download-url 401 without header, non-401 with header.
**DoD** Button works; 401 shows toast; no presign/bucket layout changes.
**Progress** | Phase | Step | Title | Status |
| 04 | 37 | Wire Download Button | Done |
## Phase 04 · Step 37.1 — Recovery: restore working Review UI and isolate Download logic
**What** Restored index.html from Step 36 zip, re-added Download as separate download.js, injected button and script tag, no edits to the main inline script.
**Why** Prior sed edits touched the inline script and broke Fields/History. Isolating Download prevents future regressions.
**Verify** Fields visible; History works; Download calls /api/download-url?key=...; 401 shows toast; non-401 with dev key when required.
**Status** Stable.
## Phase 04 · Step 37.2 — Download opens in new tab
**When:** 2025-10-09T09:57:06Z
**Change** In download.js, replace anchor-click approach with window.open(url,'_blank','noopener') to prevent the Review tab from navigating away.
**Reason** Preserve History/Fields state after download; cross-origin URLs ignore the download attribute.
**Verification** Download opens in a new tab; Review UI state persists; History stays visible.
## Phase 04 · Step 37 — Wire Download Button (UI → /api/download-url)
**When:** 2025-10-09T10:13:27Z
**Objective** Add a Download original file button that calls /api/download-url with key=<current-doc-key> and opens the returned URL; include X-Dev-Key automatically when present in localStorage.
**Changes** Added a small, isolated module (packages/ocr/review/download.js) and a Download button in index.html; CSV export fixed via csv-export.fix.js to avoid page navigation; opened downloads in a new tab to preserve page state.
**Verification** Browser: open index.html and click Download original file (new tab opens). cURL: /api/health → 200; /api/download-url?key=test.txt&expires=900 → JSON with presigned S3 URL.
**DoD** Button visible; calls /api/download-url with key; 401 shows toast if enforced; page does not lose History; no changes to presign logic or bucket layout.
**Notes** Minor UI polish deferred: hide the “no changes yet” label when entries exist; History timing quirks scheduled for a later QA pass.
## Phase 04 · Step 38 — Finish AWS Storage Wiring (MVP)
Status: COMPLETE (with waiver)

What works (MVP):
- Write-side mirror to S3 via POST /api/mirror-test.
- Read-side download via /api/download-url (presigned S3).
- Minimal env validation (fails fast if MIRROR_TO_S3=1 and S3 vars missing).

Known gap (waived for MVP):
- Review UI’s “Download original file” fails for legacy key `salary` (no folder prefix). Root cause: object with that exact S3 key isn’t guaranteed to exist. This is a keying convention issue, not a storage failure.

Deferred to Audit/Reporting phase:
- Standardize S3 key scheme (e.g., uploads/<yyyy>/<mm>/<dd>/<user>/<filename>).
- Ensure upload flow mirrors originals with canonical keys used by the UI.
- Add audit trail/reporting + optional lifecycle rules.

Verification (performed):
1) curl -s http://localhost:5055/api/health → ok
2) curl -s -X POST -H "x-dev-key: $DEV_KEY" /api/mirror-test → {ok:true, bucket, key}
3) curl -s -H "x-dev-key: $DEV_KEY" "/api/download-url?key=<key>&expires=300" → presigned URL works
## Phase 04 · Step 39 — Integrate S3 Mirroring into Real Upload Routes (MVP)
Status: COMPLETE

Changes:
- review.save.route.mjs now mirrors corrected JSON to S3 (best-effort) via tools/mirror-corrected.mjs.
- upload-corrected.route.mjs already mirrored to S3; left unchanged.

Verify:
1) Perform a normal upload/save in the UI → server logs show mirror:ok.
2) /api/download-url?key=<key> returns a valid presigned URL for the new object.

Acceptance:
- Newly saved or corrected files are mirrored to S3 when MIRROR_TO_S3=1.
- Requests do not fail if mirroring fails; errors are logged.

Progress:
- Phase 04 storage wiring: Read-side presign ✅, Write-side mirror (test + real routes) ✅, Minimal env validation ✅.
- Remaining (deferred): canonical S3 key scheme; bucket lifecycle; audit/reporting UX.

## 2025-10-09 — Phase 05 · Step 01 · Microstep 08
- Added prefill schema validator (scripts/prefill.schema.validate.mjs)
- Introduced line-codes map (artifacts/modelo100/linecodes.v1.json) and wired into report emitter
- Report now validates before emit and includes line codes in MD/CSV
- Acceptance: validator prints 'OK prefill schema'; report files exist with line_code column

## Phase 05 — Prefill→Validate→Report + Annotations & Summary Checks (Complete — 2025-10-09)

**What changed**
- Added chain runner to orchestrate prefill → schema validation → report.
- Added field-level annotated report (schema line, raw, computed).
- Added summary validation (totals vs components with tolerance).

**Why**
- Make outputs auditable and explainable at field level.
- Catch silent arithmetic drift early with explicit + heuristic checks.

**Artifacts**
- Scripts: `scripts/modelo100.chain.run.mjs`, `scripts/modelo100.report.annotated.mjs`, `scripts/modelo100.validation.summary.mjs`
- Reports: `artifacts/modelo100/report.annotated.{csv,md}`
- Summary checks: `artifacts/modelo100/validation.summary.{json,csv,md}`, optional rules: `artifacts/modelo100/validation.summary.rules.json`

**Acceptance**
- Chain runs end-to-end with no errors.
- Annotated report present and non-empty.
- Summary validation emits PASS/FAIL rows as expected.

**Progress**
| Item | Done |
|---|---|
| Prefill script stabilized | ✅ |
| Schema guard | ✅ |
| Chain script | ✅ |
| Report emitter | ✅ |
| Field-level annotations | ✅ |
| Summary validation | ✅ |

**Next (Phase 06 — Validation Rule Packs & Governance)**
- Rule packs with severity/tags, per-rule tolerance.
- Chain gate on ERROR; WARNs allowed with audit.
- MD/CSV roll-up with counts and drill-downs.
- Mini harness to reproduce failing rules.

## 2025-10-09 — Phase 06 · Step 07 — Group roll-ups + Audit
- Added per-group roll-ups (MD/CSV) and embedded them in validation.summary.
- Added rules.audit.jsonl with env knobs, counts, failing IDs, and timestamps.
- No external deps; backward compatible.


2025-10-09 · Phase 06 · Step 08 — Added Top Failures to validation.summary.md and --json to modelo100.rule.harness.mjs (exact rule JSON with --only). Backward-compatible. Chain still fails on ok:false; will address separately.

2025-10-09 · Phase 06 · Step 09 — Added validation.delta generator producing JSON and MD, with snapshot tracking for previous rule failures.

2025-10-09 · Phase 06 · Step 09 — Wired validation.delta into chain behind ENABLE_DELTA=1. Default unchanged; when enabled, emits validation.delta.{json,md} and updates snapshot.

2025-10-09 · Phase 06 · Step 10 — Added CI compact summary and optional gate. Flags: ENABLE_GATE=1, GATE_MAX_FAILS, GATE_BLOCK_SEVERITY, GATE_PRINT. Default chain unchanged.

2025-10-09 · Phase 06 · Step 11 — Added tags/severity coverage report (JSON/MD/CSV) with optional chain flag ENABLE_COVERAGE=1. Default chain unchanged.

2025-10-09 · Phase 06 · Step 12 — Added Markdown auto-linking of [RULE_ID] and [GROUP:slug] to rollup anchors; optional chain flag ENABLE_AUTOLINK=1. Default chain unchanged.

2025-10-09 · Phase 06 · Step 13 — Added Flaky Watch. Logs per-run rule pass/fail, computes oscillation index over window (FLAKY_WINDOW, default 10), emits flaky.index.{json,md}. Optional chain flag ENABLE_FLAKY=1.

2025-10-09 · Phase 06 · Step 13 — Added Flaky Watch (history log, flaky index JSON/MD). Optional ENABLE_FLAKY=1 runs it in the chain; default behavior unchanged.

[2025-10-10] Phase 06 · Step 14 — Rules Index (MD): Added scripts/modelo100.rules.index.mjs. Generates artifacts/modelo100/rules.index.md with summary + table and links to rollups. Supports RULE_TAG and RULE_SEVERITY filters. Optional chain hook via ENABLE_RULE_INDEX=1.

## 2025-10-10 — Phase 06 · Step 16
- Added Rule Insights Dashboard generator (`scripts/modelo100.rules.insights.html.mjs`).
- Produces `artifacts/modelo100/rules.insights.html` with severity bar chart, top-10 tag table, total count, and timestamp.
- Bars/tags link to `rules.index.html` via `?severity=` / `?tag=`.
- Optional via `ENABLE_RULE_INSIGHTS_HTML=1`.

## 2025-10-10 — Phase 06 · Step 17
- Enhanced Rules Explorer with client-side filters and deep links.
- New generator: `scripts/modelo100.rules.index.explorer.mjs` (gated by `ENABLE_RULE_INDEX_FILTERS=1`).
- Output: `artifacts/modelo100/rules.index.html` supports `?severity=`, `?tag=`, `?q=`.

## 2025-10-10 — Phase 06 · Step 18
- Added Trend Mini-Sparklines generator (`scripts/modelo100.rules.insights.trend.mjs`).
- Creates dated snapshots under `artifacts/modelo100/history/` and injects inline SVG sparklines into `rules.insights.html`.
- Pure client-side, 14-day window, graceful fallback if insufficient data.

## 2025-10-10 — Phase 06 · Step 19
- Added unified dashboard wrapper (`scripts/modelo100.rules.dashboard.html.mjs`).
- Output: `artifacts/modelo100/rules.dashboard.html` embeds Insights + Explorer with shared filters via postMessage + query params.
- Gated by `ENABLE_RULES_DASHBOARD=1`.

## 2025-10-10 — Phase 06 · Step 19
- Unified Rules Dashboard wrapper added (`scripts/modelo100.rules.dashboard.html.mjs`).
- Explorer/Insights hardened: placeholder rows ignored; header shows Total vs Shown; empty-state row.
- Outputs: `artifacts/modelo100/rules.dashboard.html`, `rules.index.html`, `rules.insights.html`.
- Gated by `ENABLE_RULES_DASHBOARD=1`.

## Phase 06 · Step 21 — CI Publish Task & Release Artifact

**Goal:** Automate building and releasing the offline rules dashboard bundle.

**Triggers:** Tag push `vX.Y.Z` or manual dispatch.

**Process:**
1. CI runs `scripts/modelo100.rules.publish.mjs` with `ENABLE_RULES_PUBLISH=1`.
2. Bundle is verified: `artifacts/modelo100/rules-dashboard-bundle.zip`.
3. Build stamp computed as `YYYYMMDDTHHMMSSZ-<shortsha>`.
4. Files prepared:
   - `rules-dashboard-bundle-<STAMP>.zip`
   - `release-notes.md` from `docs/publish-notes.md` with `{{TAG}}` and `{{STAMP}}` injected.
5. For tag builds: a GitHub Release is created with the asset attached.
6. For manual runs: files are uploaded as workflow artifacts.

**Acceptance:**
- Tag push or manual run yields a zipped bundle and attached artifact/release asset.
- Release notes include the build stamp and a changelog stub.
- Workflow uses only Node and filesystem operations; no external build toolchain.

**Rollback:** Delete the release and rerun on a new tag.


## Phase 11 — AI & Tax Rules Integration (Kickoff)
- Started: 2025-10-13 08:06 UTC
- Scope: AI-assisted extraction for tax law → rules DB; connect OCR outputs to rules mapping; build validation harness.
- Next Steps: scaffold scripts/ai.extract.rules.mjs; define rules schema; add tests and sample inputs; wire to modelo100 rules apply.
- Acceptance (initial): script scaffolded; rules accept auto-populated entries; sample tests pass.
2025-10-13 · Phase 11 Step 11.1 started — AI extraction scaffolding initialized.
## Phase 11 · Step 11.2 — Rule Scoring & Source Weighting — Completed $ts
- Added schemas/rule_score.schema.json
- Implemented scripts/ai.score.rules.mjs with authority/clarity/applicability in [0,1]
- Integrated scoring into scripts/ai.extract.rules.mjs
- Updated extraction_result schema to require "score"
- Patched golden fixture with example scores
**Acceptance:** Validation green on samples; extractor emits score{authority,clarity,applicability}; values within [0,1].
**Next:** Step 11.3 starter prompt below; upload repo ZIP + manifest before starting.
## Phase 11 · Step 11.5 — Rule Application & Conflict Resolution · Design Decisions ($ts)
- Conflict handling: auto-select higher authority; also flag the alternative as "Interesting reading" for lawyer follow-up.
- Temporal basis: situation-dependent; chatbot assists lawyer to refine if/then logic when ambiguity exists.
- Output detail: include the entire applied rule snapshot (not just IDs) for auditability.
- Post-build TODO: consider daily discrepancy notifier + weekly Slack digest (depends on real-world workflow outcomes).

## 2025-10-13 12:52:33 +0200 — Phase 11 · Step 11.6 Complete
- Lawyer review loop in Spanish with append-only log
- Minimal states: open → picked_up → answered → closed
- Deterministic export, transition script, optional Slack
- Artifacts: artifacts/phase11-11.6.manifest.txt, artifacts/iberitax-post11.6.zip

## 2025-10-13 12:55:47 +0200 — Start Phase 11 · Step 11.7
- Lawyer dashboard UX scaffolded
## 2025-10-13 — Phase 11 · Step 11.7 — Lawyer Dashboard & Hand-off UX (Spanish)
Status: COMPLETE
- UI: /lawyer/ (lista, filtros, acciones: Recoger, Responder, Cerrar).
- API: GET /api/lawyer/review.jsonl; POST /api/lawyer/{picked_up,answered,closed}.
- JSONL append con snapshots en cierre; Slack opcional por SLACK_WEBHOOK_URL.
Acceptance:
- Carga determinística desde JSONL: OK.
- Cambios de estado visibles tras refresco: OK.
- Slack opcional configurado: OK (simulado).
Artifacts:
- apps/stub-server/public/lawyer/index.html
- apps/stub-server/src/dev.server.mjs
- apps/stub-server/src/routes/lawyer.*.mjs
- apps/stub-server/src/tools/slack.mjs
- artifacts/review/lawyer_review.log.jsonl
Next: Step 11.8 — Auth + ownership + CSV export.

## 2025-10-13T12:44:44Z — Phase 11 · Step 11.8 (Hardening)
- POST auth via x-lawyer-secret (+ ?dev-auth=1)
- Ownership lock (409) on pick-up
- CSV export wired in router at /api/lawyer/closed.csv and /api/lawyer/closed/csv (also GET /api/lawyer/closed)
- Acceptance verified: 401 unauth, 409 second pick, CSV export OK
