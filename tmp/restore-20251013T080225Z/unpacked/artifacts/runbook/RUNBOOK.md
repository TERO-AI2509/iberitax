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
