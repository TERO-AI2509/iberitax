# TERO Fiscal 13.0-rc1 — Release Notes

## Highlights
- Phase 13 rebrand & cleanup complete.
- Phase 12.1: CI/CD lock + RC pipeline GREEN.
- Phase 12.2: Env & secrets centralized on Vercel; proxy in place; removed NEXT_PUBLIC_LAWYER_API_BASE.
- Phase 12.3: Switched from placeholder DB to Neon Postgres; prod env variables set (`TERO_DB_URL`, `TERO_PRISMA_URL`).

## Migrations / Data
- Initial Postgres (Neon, free tier). No destructive migrations in this RC.

## Deploy
- Branch protection + RC pipeline to Vercel. Deploy from `main` produces 13.0-rc1.
- Env: pulled via `vercel env pull .env.vercel --environment=production`.

## Rollback
- Revert `main` to last green commit and redeploy (Vercel preserves previous build).
- DB: Neon branch snapshot restore if needed (free tier supports history & branches).

## Observability
- Vercel Analytics (edge + serverless), project logs.
- Healthcheck: `/api/health` (returns 200 + build info).
- Error tracking: Next.js/Vercel logs (upgrade plan to add Sentry—tracked for GA).

## Config & Policy
- Secrets live only in Vercel env. Local dev uses `.env.vercel` (never committed).
- DB URLs are scoped per-env; no secrets in `NEXT_PUBLIC_*`.

## DNS
- No change for RC. Production cutover uses existing apex; see handoff checklist.

## Access
- Vercel: Owners = Ops; Maintainers = Core devs; Viewers = Stakeholders.
- Neon: org owner + read-only role for BI (post-GA task).

## Known Issues
- Observability depth limited on free tiers; plan upgrades before GA.

## References
- PR #35 (Phase 12.3 docs) — adds these notes and handoff checklist.
