# Pull Request Checklist

- [ ] Run SLA CI locally: `node scripts/modelo100.rules.meta.sla.mjs && node scripts/modelo100.rules.meta.ci.sla.mjs`
- [ ] If failing, justify or set `SLA_ALLOW=1` and re-run
- [ ] Check GitHub job annotations for SLA details
- [ ] If `SLA_WEBHOOK_URL` is configured, verify a notification was sent

- [ ] Update `docs/owners.routes.json` with real webhooks (or keep empty to disable)
- [ ] Verify queue builds: `node scripts/modelo100.routes.build.mjs`
- [ ] Dry-run notify locally (no sends): `node scripts/modelo100.routes.notify.mjs`
- [ ] If enabling sends in CI, set `NOTIFY_ENABLE=1` and ensure routes are correct

- [ ] Update `docs/owners.routes.json` with real webhooks (or keep empty to disable)
- [ ] Verify queue builds: `node scripts/modelo100.routes.build.mjs`
- [ ] Dry-run notify locally (no sends): `node scripts/modelo100.routes.notify.mjs`
- [ ] If enabling sends in CI, set `NOTIFY_ENABLE=1` and ensure routes are correct

- [ ] SLA snapshot generated (`sla.day-YYYYMMDD.json`)
- [ ] Trends updated (`sla.trends.json`, `sla.trends.csv`)
- [ ] Insights SLA panel verified
- [ ] Dashboard SLA tile verified
- [ ] CI artifacts and Job Summary checked
- [ ] SLA thresholds reviewed (`docs/sla.thresholds.json`)
- [ ] Alerts file generated (`artifacts/modelo100/sla.alerts.json`)
- [ ] Insights SLA badge visible
- [ ] Dashboard SLA tile visible
- [ ] CI alerts summary shows overall status
- [ ] Notifications dry-run ok; real sends only with `NOTIFY_ENABLE=1`
- [ ] Owner daily snapshot generated
- [ ] Owner trends JSON/CSV produced
- [ ] Owner drill-down HTML loads with data
- [ ] Insights/Dashboard link to owner page
- [ ] CI shows Top-5 owners (7d) in Job Summary
- [ ] Owner thresholds reviewed and checked in
- [ ] Owner alerts JSON/CSV generated
- [ ] Escalation matrix applied; escalations JSON/CSV generated
- [ ] Optional notifications tested (dry-run and gated send)
- [ ] CI Job Summary lists owners over budget and escalations

- [ ] Step 36: Signed `sla.export.json` generated
- [ ] Step 36: `public/` bundle rebuilt and opened locally
- [ ] Step 36: CI workflow present and green

- [ ] Step 37: Pages deployment green
- [ ] Step 37: Versioned dir present and listed in `index.json`
- [ ] Step 37: `sitemap.xml` and `robots.txt` valid
- [ ] Step 37: Badges show correct counts

- [ ] Step 38: Queue generated from SLA artifacts
- [ ] Step 38: Notifier dry-run outputs per-owner payloads
- [ ] Step 38: QA report shows zero unexpected failures

- [ ] Step 39: CSV snapshots generated and reviewed
- [ ] Step 39: Public API built (summary.json, owners.json, badges.json)
- [ ] Step 39: Reporting CI green and artifacts downloadable
- [ ] Style: Blocks end with explicit success echo

- [ ] Step 40: Cleanup scan report generated
- [ ] Step 40: Quarantine tested on a small set if needed
- [ ] Step 40: Runbook updated with Phase 06 summary and one-shot CLI

- [ ] Phase 07.1: Validate mapping (`node scripts/modelo100.fields.map.validate.mjs`)

- [ ] Phase 07.2: Run dry-run and apply for mapper (`node scripts/modelo100.rules.apply.mjs`)

- [ ] Phase 07.3: Generate mapped CSV and HTML reports

- [ ] Phase 07.4: CLI commands `map-apply`, `map-report`, `map-all` tested (dry-run + apply).
