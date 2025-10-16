
## 2025-09-28 — Phase 02 Step 09 Completed
Deliverables:
- Browser PUT with progress (`putFile`) in @iberitax/uploader.
- `/upload` wired to initUpload → putFile with live progress and success summary.
- Unit test for putFile (Node/fetch path).
- Client-only import path via subpath export (`@iberitax/uploader/client`).
- Jest/preflight wiring stable; TypeScript build passing.

Acceptance:
- pnpm -C apps/web dev boots, /upload shows progress and success summary.
- pnpm -C packages/uploader test is green.
- No server code pulled into browser bundles.

## Lessons Learned (do this from the start)

1) Client/server split for shared packages
- Never import a package root that re-exports server modules from browser code.
- Provide a client-only subpath export:
  - packages/uploader/package.json → "exports": { "./client": "./dist/client.js" }
  - Web code imports from "@iberitax/uploader/client".

2) DOM globals in Node tests
- Do not reference DOM globals by identifier in shared code.
- Use guarded access:
  - if (typeof (globalThis as any).XMLHttpRequest !== "undefined") { const xhr = new (globalThis as any).XMLHttpRequest(); }
- Provide Node/test fallback (fetch) without DOM types.
- In tests, if TS infers unknown, annotate or locally cast.

3) Preflight + Jest
- Prefer separate scripts rather than chaining inline with shell quoting:
  - "pretest": "tools/check-esm-jest.sh"
  - "test": "jest --config jest.config.cjs"
- If a package needs a stable path to the root script, add a wrapper at packages/<pkg>/tools/check-esm-jest.sh that resolves repo root and execs the root script.
- Avoid fragile shell quoting in jq updates; perform two discrete jq edits when needed.

4) Next.js bundling
- Any server dependency (fs, express, send) must not leak into client bundles.
- Ensure the browser code imports only client surfaces (see 1).

5) CI predictability
- Keep preflight null-safe: jq checks must not fail when fields are missing.
- Tests should run even if workspace metadata is absent.

## Known pitfalls to avoid
- Do not use applypatch in instructions or scripts.
- Do not chain commands inside JSON with complex quotes; prefer separate lifecycle scripts or a local wrapper.
- Do not rely on global DOM libs in TypeScript builds for shared packages.

## Phase 02 Remaining Steps
- Step 10: Shareable download URL on success, UI copy button, tests.
- Step 11: User-friendly errors, simple retry, basic validation, tests.
- Step 12: UX polish (disable/cancel), a11y pass, final test sweep.


## Rules Dashboard (deploy 2025-10-11T15:39:20Z)

- Live: https://tero-ai2509.github.io/iberitax/
- Bundle: See latest artifact in Actions → *Publish Rules Dashboard Bundle*
- Contents: `index.html`, `rules.dashboard.html`, `rules.index.html`, `rules.insights.html`

## Phase 06 · Step 27 — SLA Timers & Status Transitions

SLA (Service Level Agreement) thresholds:
- critical: 14 days
- high: 30 days
- medium: 60 days
- low: 90 days
- unspecified: ignored

Pipeline:
1) `node scripts/modelo100.rules.meta.sla.mjs` → emits `rules.meta.sla.json` and `rules.meta.sla.csv`.
2) Insights/Dashboard render an SLA panel with breach counts.
3) CI gate fails on breaches unless `SLA_ALLOW=1`.

Exit codes:
- 0: ok or override active
- 1: SLA breach
- 2: missing inputs
- 3: schema mismatch

Override:
- `SLA_ALLOW=1` to acknowledge temporary breach (must be justified in PR).
### Note — Step 27 implementation detail
To avoid brittle source edits, SLA is surfaced via post-build injectors:
- `scripts/modelo100.insights.sla.inject.mjs` (adds panel to `rules.insights.html`)
- `scripts/modelo100.dashboard.sla.inject.mjs` (adds card to `rules.dashboard.html`)
CI enforcement is handled by `scripts/modelo100.rules.meta.ci.sla.mjs`. Run with:
- strict: `node scripts/modelo100.rules.meta.ci.sla.mjs`
- override: `SLA_ALLOW=1 node scripts/modelo100.rules.meta.ci.sla.mjs`

## CI — SLA Check

Workflow: `.github/workflows/sla-check.yml`
Commands:
1) `node scripts/modelo100.rules.meta.sla.mjs`
2) `node scripts/modelo100.rules.meta.ci.sla.mjs`
3) `node scripts/modelo100.sla.annotate.mjs`

Override: set `SLA_ALLOW=1` to acknowledge temporary breaches.
Webhook: set `SLA_WEBHOOK_URL` secret to receive JSON summary.

### CI — Artifacts & Summary

- The SLA workflow uploads: `rules.meta.sla.csv`, `rules.meta.sla.json`, `rules.insights.html`, `rules.dashboard.html` (retained 7 days).
- A CI Job Summary shows totals and the top breaches.
- Configure `SLA_WEBHOOK_URL` secret to receive the JSON payload posted by the workflow.

### Owner Routing (MVP)

- Routes: `docs/owners.routes.json` mapping `owner` → `{ webhook }`.
- Build queue: `node scripts/modelo100.routes.build.mjs` → `artifacts/modelo100/notify/`.
- Notify: `node scripts/modelo100.routes.notify.mjs` (dry-run; set `NOTIFY_ENABLE=1` to send).
- CI: workflow runs builder + notifier non-fatally; sending only when `NOTIFY_ENABLE=1`.

### Owner Routing (MVP)

- Routes: `docs/owners.routes.json` mapping `owner` → `{ webhook }`.
- Build queue: `node scripts/modelo100.routes.build.mjs` → `artifacts/modelo100/notify/`.
- Notify: `node scripts/modelo100.routes.notify.mjs` (dry-run; set `NOTIFY_ENABLE=1` to send).
- CI: workflow runs builder + notifier non-fatally; sending only when `NOTIFY_ENABLE=1`.

## SLA Trend Tracking (7/30/90)

- Snapshot: `node scripts/modelo100.sla.snapshot.mjs` → `artifacts/modelo100/sla.day-YYYYMMDD.json`.
- Trends: `node scripts/modelo100.sla.trends.mjs` → `sla.trends.json` + `sla.trends.csv`.
- Insights: SLA Trends panel with sparkline (inline JS).
- Dashboard: SLA breach rate tile (7/30/90).
- CI: `.github/workflows/sla-trends.yml` runs on push and daily; uploads artifacts and prints a summary.

### SLA Budgets & Alerting

- Thresholds: `docs/sla.thresholds.json` (warn/fail per window).
- Evaluator: `node scripts/modelo100.sla.alerts.mjs` → `sla.alerts.json`.
- Insights/Dashboard: SLA badge and window statuses.
- Notify: `node scripts/modelo100.sla.notify.mjs` (dry-run; set `NOTIFY_ENABLE=1` to send).

### Owner SLA Drill-downs

- Daily owner snapshot: `node scripts/modelo100.sla.owner.snapshot.mjs` → `sla.owner.day-YYYYMMDD.json`.
- Owner trends: `node scripts/modelo100.sla.owners.trends.mjs` → `sla.owner.trends.json` + `.csv` + `sla.owner.top.json`.
- HTML: `artifacts/modelo100/sla.owners.html` with filter/sort.
- Links: injected into Insights/Dashboard.
- CI: owner snapshot+trends, artifact upload, and Top-5 summary.

### Per-Owner SLA Budgets & Auto-Escalation

- Thresholds per owner: `docs/owner.sla.thresholds.json` (wildcard `*` supported).
- Alerts per owner: `node scripts/modelo100.sla.owner.alerts.mjs` → `sla.owner.alerts.json` + `.csv`.
- Streaks & escalation: `docs/sla.escalation.matrix.json` rules → `sla.owner.escalations.json` + `.csv`.
- Notify per owner: `node scripts/modelo100.sla.owner.notify.mjs` (dry-run; set `NOTIFY_ENABLE=1` to send).
- CI: extended to compute owner alerts, escalations, and summarize in Job Summary.

### Step 36 — SLA Export + Public Bundle

- Generate signed export: `APPLY=1 node scripts/modelo100.sla.export.mjs`
- Build public bundle: `APPLY=1 MINIFY_HTML=1 node scripts/modelo100.public.bundle.mjs`
- CI: `.github/workflows/sla-export-bundle.yml` runs on push + daily cron
- Outputs:
  - `artifacts/modelo100/sla.export.json`
  - `artifacts/modelo100/public/` (index.html, css, htmls, json)

### Step 37 — SLA Public Pages + Versioning + Badges

- Pages workflow: `.github/workflows/sla-pages.yml`
- Versioned snapshot: `public/v-YYYYMMDD-<shortsha>/` with `index.json`
- Discoverability: `public/sitemap.xml`, `public/robots.txt`
- Badges: `public/badges/*.json` (schemaVersion 1)
- Verify Pages deployment in Actions → Deployments

### Step 38 — Monitoring Hooks + Alert Routing QA

- Build queue: `APPLY=1 node scripts/modelo100.monitor.queue.mjs`
- Routes: `docs/owners.routes.json`
- Notify (dry-run default): `APPLY=1 node scripts/modelo100.monitor.notify.mjs`
- Enable live POSTs by setting `NOTIFY_ENABLE=1`
- QA: `node scripts/modelo100.monitor.qa.mjs`

### Step 39 — Reporting Endpoints + CSV Snapshots

- CSV snapshots: `APPLY=1 node scripts/modelo100.report.csv.mjs` → `artifacts/modelo100/report/`
- Public API: `APPLY=1 node scripts/modelo100.public.api.mjs` → `artifacts/modelo100/public/api/`
- CI: `.github/workflows/sla-reporting.yml` (push + daily cron)
- Verification: open `owners.csv`, `summary.csv`, and `public/api/summary.json`

#### Work Instruction — Success Echo
- End every POSIX block with a success echo line: `echo \"OK <step>\"`.

### Phase 06 Consolidation — Single CLI

- One-shot: `APPLY=1 MINIFY_HTML=1 MODE=all node scripts/modelo100.cli.mjs all`
- Or run a sub-step: `APPLY=1 node scripts/modelo100.cli.mjs export|bundle|extras|report-csv|public-api`

## Phase 06 — Summary

- SLA insights, dashboards, owners drill-downs, and public bundle published to Pages.
- Signed `sla.export.json` plus CSV snapshots and public API endpoints.
- Single CLI orchestrator: `scripts/modelo100.cli.mjs`.
- Monitoring queue + notifier (dry-run by default).

## Cleanup Policy
- Nightly scan: `.github/workflows/repo-cleanup-scan.yml` uploads `cleanup.report.json`.
- Quarantine flow: `APPLY=1 node scripts/repo.cleanup.quarantine.mjs` moves candidates into `attic/<ts>/` with a manifest.
- Always review the manifest and verify CI before deleting anything permanently.

## One-shot Build
APPLY=1 MINIFY_HTML=1 MODE=all node scripts/modelo100.cli.mjs all

### Phase 07.1 — Field Mapping Schema
- Files: `docs/modelo100.fields.map.schema.json`, `docs/modelo100.fields.map.json`
- Validate: `node scripts/modelo100.fields.map.validate.mjs` → `artifacts/modelo100/fields.map.validate.json`
- Notes: Replace TODOs as rules are wired in 07.2/07.3.

### Phase 07.2 — Rule Application Engine
- Command (dry-run): `node scripts/modelo100.rules.apply.mjs`
- Command (apply): `APPLY=1 node scripts/modelo100.rules.apply.mjs`
- Inputs: `artifacts/modelo100/ocr.normalized.json` (override with `OCR_JSON`), optional `artifacts/modelo100/rules.eval.json`
- Mapping: `docs/modelo100.fields.map.json`
- Output: `artifacts/modelo100/mapped.json` (apply only) with `summary`, `fields{}`, and `trace{}`

### Phase 07.3 — Mapped CSV + HTML Reports
- CSV: `node scripts/modelo100.mapped.csv.mjs` → `artifacts/modelo100/mapped.csv`
- HTML: `node scripts/modelo100.mapped.html.mjs` → `artifacts/modelo100/mapped.html`
- Inputs: `artifacts/modelo100/mapped.json` (from 07.2)
- Status schema: ok|warning|missing based on value and per-field warnings

### Phase 07.4 — CLI Integration
- Commands:
  - Dry-run apply: `node scripts/modelo100.cli.mjs map-apply`
  - Apply+write: `APPLY=1 node scripts/modelo100.cli.mjs map-apply`
  - Reports: `node scripts/modelo100.cli.mjs map-report`
  - One-shot: `node scripts/modelo100.cli.mjs map-all`
- Inputs:
  - OCR_JSON (default `artifacts/modelo100/ocr.normalized.json`)
  - RULES_JSON (optional; default `artifacts/modelo100/rules.eval.json`)
  - MAP_JSON (default `docs/modelo100.fields.map.json`)
- Outputs:
  - `artifacts/modelo100/mapped.json|csv|html`

### Phase 08 — Admin / Support Tools

**CLI usage:**

```
node scripts/modelo100.cli.mjs admin map-health --out artifacts/modelo100/health.report.json
APPLY=1 node scripts/modelo100.cli.mjs admin owners
APPLY=1 STALE_DAYS=90 node scripts/modelo100.cli.mjs admin stale
```

- Outputs: `artifacts/modelo100/owners.*`, `rules.stale.*`, `health.report.json`
- CI: `.github/workflows/rules-maintenance.yml` uploads artifacts and writes job summary.

## Phase 09 · Step 09.2 — Redactor CLI & CI Gate (DONE)
- Script: scripts/security.redact.mjs
- Modes: dry-run (default), APPLY=1 (write), GIT_CI=1 (warn-only)
- Output: JSON summary → artifacts/modelo100/redact.test.json
- Next: 09.3 — Export/Delete scripts (local) + docs

## Phase 09 · Step 09.3 — Export/Delete (DONE)
- Export: `node scripts/security.userdata.export.mjs "<query>" [--redact]` → `artifacts/modelo100/export/<ts>/`
- Delete: `node scripts/security.userdata.delete.mjs "<query>"` (dry-run), `APPLY=1` to apply → `report/quarantine/<ts>/`
- Tombstone left in place of deleted files; full log in `delete.log.json`.
- Next: 09.4 — Secrets & CI hygiene audit.

### 09.3 Update — tmp scanning
- Default scope: artifacts/, report/, uploads/, history/, notify/, top-level mapped/ocr files.
- Local testing: set `SCAN_TMP=1` to include tmp/.

## Phase 09 · Step 09.4 — Secrets & CI Hygiene (DONE)
- Secrets patterns: docs/security/secrets.patterns.json
- CLIs: scripts/security.secrets.scan.mjs, scripts/security.ci.hygiene.mjs, scripts/security.dotenv.lint.mjs
- Local run: see artifacts/modelo100/* for JSON reports
- CI: .github/workflows/security-baseline.yml fails on findings
- Mitigation: add to .gitignore, rotate keys, redact with 09.2, avoid plaintext env in workflows

## Phase 10 — System Governance & Backup Integration

- 10.1 Backup scheduler + snapshot script: **Done**
  - Workflow: `.github/workflows/backup.daily.yml`
  - Script: `scripts/backup.snapshot.mjs`
  - Outputs: `artifacts/backups/backup-*.zip`, `.sha256`, `.meta.json`
- 10.2 Integrity & checksum verifier: **In progress**
  - Workflow: `.github/workflows/backup.verify.yml`
  - Script: `scripts/backup.verify.mjs`
  - Reports: `artifacts/backups/verify.json`, `verify.html`

### Evidence
- Manifest: `repo-manifest-phase10-step01.txt`
- Bundle: `iberitax-phase10-step01.zip`

### Next
- Finish 10.2, then 10.3 Governance report and 10.4 Final audit bundle.
