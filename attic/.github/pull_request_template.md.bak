
### Modelo 100 — Rules Dashboard (Step 23)
- [ ] Owner / Status / Updated visible per rule
- [ ] Index filters by severity and tag work together
- [ ] Search matches id, message, tags, owner, status
- [ ] Grouped layout shows per-severity counts
- [ ] Dashboard top-bar shows totals by severity and top tags
- [ ] Validator emits warnings for missing optional fields
- [ ] rules.index.html and rules.dashboard.html render without console errors

### Modelo 100 — Metadata Completeness (Step 24)
- [ ] rules.meta.csv generated with owner/status/updated columns
- [ ] rules.meta.missing.csv and .json list incomplete rows
- [ ] Insights page shows a Missing metadata panel with search
- [ ] Dashboard includes the updated Insights with panel visible

### Modelo 100 — Authoring + CI guard (Step 25)
- [ ] rules.meta.csv edited and applied back to sources via meta.apply script
- [ ] Updated CSV/MD contain owner/status/updated for targeted rules
- [ ] meta.export regenerates meta.missing.* with lower or zero missing count
- [ ] meta.ci fails when missing > 0 unless ALLOW_MISSING=1
- [ ] Date format for updated is YYYY-MM-DD

### Modelo 100 — Step 26: Bulk ownership + stale detector + tag hygiene
- [ ] meta.bulk can select by tag or severity and merge into rules.meta.csv
- [ ] meta.stale flags rules older than threshold and writes JSON/CSV
- [ ] tags.hygiene report shows empty and non-lowercase tags
- [ ] Insights shows Missing, Stale, and Tag Hygiene panels
