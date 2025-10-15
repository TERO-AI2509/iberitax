## Phase 06 · Step 22 — Rules ingestion from /rules — 2025-10-12 11:21
What changed
- Added CSV/MD ingestion via scripts/modelo100.rules.load.mjs
- Generators load ctx.rules; default exports async
- Validator enforces schema and non-empty index
- 5 sample rules added; HTML post-append for visibility

Acceptance
- Build succeeds for index and dashboard
- Validator ok:true and count>0
- RULE IDs visible in rules.index.html and rules.insights.html
Next
- Add owner, links, impacted_boxes fields
- Wire UI filters for severity and tags

## Phase 11 — AI & Tax Rules Integration (Kickoff)
- Started: 2025-10-13 08:06 UTC
- Scope: AI-assisted extraction for tax law → rules DB; connect OCR outputs to rules mapping; build validation harness.
- Next Steps: scaffold scripts/ai.extract.rules.mjs; define rules schema; add tests and sample inputs; wire to modelo100 rules apply.
- Acceptance (initial): script scaffolded; rules accept auto-populated entries; sample tests pass.
Phase 11 · Step 11.5 — Rule Application & Conflict Resolution
Status: Done at 2025-10-13T12:47:52+02:00
Notes: Deterministic selector; conflicts flagged as 'Interesting reading'. Next: 11.6 Lawyer Review Loop (Spanish) + Slack wiring.
Backlog: Move periodic jobs to cloud.
