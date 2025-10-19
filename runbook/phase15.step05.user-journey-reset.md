# Phase 15 · Step 05 — User Journey Reset (Client Story E2E)

## Objective
Secure E2E journey: Homepage → Login → Payment → Create Client → Start Declaration → Questionnaire → Review → Submit. Scope tied to {clientId → returnId}. Payment required before return creation. Review → Submit locks the return.

## Implemented
- Data: `clients(id, user_id, paid)` and `returns(id, client_id, status)` with indexes and FK.
- Guards: server-side ownership checks on every Client/Return page and API.
- LocalStorage: namespacing helper `client:{clientId}:return:{returnId}:*`.
- Navigation: single layout under `/client/[clientId]/flow/[returnId]`.
- Payment: Stripe stub on `/client/[clientId]/billing` with webhook placeholder; `/start` only works if `paid=true`.
- Flow: existing Flow embedded at `/client/[clientId]/flow/[returnId]/overview` to preserve current UI.
- Review/Submit: locker sets `status="locked"`; re-entry read-only is enforced by API layer.

## Verification
- Guessing UUIDs always yields 404.
- Return can be created only after `clients.paid=true`.
- Deep links hydrate within active {clientId, returnId}.
- After submit, writes blocked; pages render without edit actions.

## Artifacts
- SQL migration at `apps/web/prisma/migrations/20251018_user_journey_reset/migration.sql`
- New route files and guards under `apps/web/app` and `apps/web/lib`

## Next
- Wire real Stripe Checkout+Webhook.
- Add read-only gating in UI when `status="locked"`.
- Migrate more legacy Flow subpages under the new path incrementally.

### Prisma env note
- Prisma CLI reads `.env` by default (not `.env.local`). Added:
  - `DATABASE_URL="file:./apps/web/prisma/dev.db"`
- Use `--dotenv-path .env` with Prisma commands in this monorepo.

