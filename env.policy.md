# Env Policy — TERO Fiscal

Canonical source: Vercel Project → Environment Variables (Development/Preview/Production).
Local .env usage: dev-only values that must not live in Vercel (purely local tooling, throwaway test keys).
Naming: Prefer TERO_* for server-side secrets and config. IBERITAX_* accepted via shim (legacy).
Public config: Only non-sensitive values may use NEXT_PUBLIC_* and are safe to expose to the browser.

Classification rules:
- SECRET (server-only): credentials, tokens, URLs with credentials, signing secrets.
- CONFIG (server-only): internal toggles and endpoints not needed by client.
- PUBLIC (client-allowed): URLs or flags explicitly safe for the browser.

Operational rules:
- All SECRET and CONFIG live in Vercel env for each target (Development/Preview/Production).
- .env committed variants contain placeholders only (.env.example), not secrets.
- Local .env may hold DEV-ONLY values that do not affect cloud deployability.

Migration rules:
- New server vars use TERO_* names.
- Legacy IBERITAX_* continue to work via shim but are deprecated.
- No sensitive values under NEXT_PUBLIC_*.

Enforcement:
- CI checks for mandatory server vars.
- PR reviewers verify no new secrets are introduced as NEXT_PUBLIC_*.
- Quarterly review: rotate secrets, prune unused vars.

