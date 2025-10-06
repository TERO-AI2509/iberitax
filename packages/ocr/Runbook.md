
## Phase 03 · Step 28 — Field Correction Planning

- Inputs:
  - `artifacts/drift/drift.classification.csv`
  - `artifacts/validation_history.md`
  - Generated `artifacts/drift/drift_amounts.csv` (from `pnpm -F @iberitax/ocr run drift:gen`)

- Actions:
  1) Refresh validation and drift:
     ```
     pnpm -F @iberitax/ocr run smoke:ocr:validate
     pnpm -F @iberitax/ocr run drift:gen
     node packages/ocr/scripts/drift.summarize.mjs
     ```
  2) Generate correction plan:
     ```
     node -e "/* see Step 28 generator in chat */"
     ```

- Outputs:
  - `artifacts/field_corrections.plan.csv`
  - Updated drift summary at `artifacts/drift/summary.md`

- Notes:
  - **Critical** fields: apply extraction/normalization toggles (`biasRightTotals`, `lineMerge`, `roiLeftTrim`, `hardFuseNumeric`, right-edge anchor, `roi.dy`).
  - **Volatile** fields: prioritize preprocessing & data quality checks (skew/rotation, DPI, locale decimal/thousand separators).
  - Proceed to Phase 04 (Mapping Rules Tuning) with `tuning.step29.json` reflecting selected toggles.


## Phase 03 · Step 30 — Tuning Iteration & Lock-In — Status @ ${TS}

**What’s working**
- Build → Validate → Drift → Snapshot OK.
- Lock-in report emitted under artifacts/drift/.
- Config plumbing correct; backups captured.

**Gaps**
- No promotions recorded in tuning.stable.json.
- field_6/field_7/field_8 still Critical; avoid relaxing global rules until per-field stabilization.

**Actions**
- Recreate tuning.stable.json from the latest delta.*.csv only when Δ_change > 0.
- Add contract/golden tests for the targeted fields.
- Expand fixtures where totals/line-wrap/skew are common.


### Step 31 · Regression Guards & Golden Tests (2025-10-06)
- **Added** per-field golden tests (fields 6 / 7 / 8) under `tests/contracts/golden/`.
- **Runner:** `pnpm -F @iberitax/ocr run test:golden`
- **CI:** integrated into `check:drift:gate`; fails on Δ > 0 or mismatch.
- **Snapshot:** `artifacts/history/phase04-guard-<timestamp>` stores lock-in + golden summaries.
- **Acceptance Criteria:** golden tests pass × 3, drift gate green, snapshot exists.
- **Next:** Begin **Phase 04 · Rule Engine Scaffolding** (tax-rule grouping & reload pipeline).


### Step 31 · Regression Guards & Golden Tests (2025-10-06)
- Added per-field golden tests under `packages/ocr/tests/contracts/golden/` (field6, field7, field8).
- Test runner: `pnpm -F @iberitax/ocr run test:golden`.
- Guard chain: `test:golden` → `drift:gen` → `check:drift:gate` (green ×3).
- Snapshot: `packages/ocr/artifacts/history/phase04-guard-<timestamp>/`.
- CI ready: `.github/workflows/ocr-guard.yml` (run goldens + drift gate; post summaries).
- Next actions: tighten goldens to field-only assertions; add OCR region snapshots; wire into PR checks.
