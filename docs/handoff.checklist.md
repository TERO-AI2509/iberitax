# Production Handoff Checklist — 13.0-rc1

## Deploy
- [ ] Confirm `main` green on RC pipeline.
- [ ] `vercel env pull .env.vercel --environment=production` on CI for build.
- [ ] Verify `TERO_DB_URL` and `TERO_PRISMA_URL` exist in Vercel prod.

## Rollback
- [ ] Revert `main` to previous green commit; Vercel auto-redeploys.
- [ ] If DB impacted, restore Neon from latest branch/snapshot.

## Observability
- [ ] Check Vercel build + runtime logs after deploy.
- [ ] Hit `/api/health` (200 expected) and smoke the dashboard.
- [ ] Review error rates in Vercel Analytics.

## Environment & Secrets Policy
- [ ] Secrets live only in Vercel. `.env.vercel` is local-only, gitignored.
- [ ] No `NEXT_PUBLIC_*` secrets; proxy remains in place.

## DNS & Domains
- [ ] RC uses existing preview domains.
- [ ] GA cutover plan documented (root/apex + www CNAMEs to Vercel).

## Access Control
- [ ] Vercel roles reviewed: Owners (Ops), Maintainers (Core devs), Viewers.
- [ ] Neon roles reviewed; ensure no prod write keys in client code.

## Exit Criteria to GA
- [ ] Sentry (or equivalent) added.
- [ ] DB backup/retention policy finalized for Neon.
- [ ] Perf baseline captured on RC traffic.

