# Iberitax MVP

Mono-repo for Iberitax MVP (apps, packages, infra).
- Package manager: PNPM
- Node >= 18
- Type-safe API client with `{ ok; data?; errors? }` envelope

## Scripts
- \`pnpm build:clients\` — build typed client
- \`pnpm demo:health\` — check stub server
- \`pnpm demo:extract\` — typed extract demo
- \`pnpm test\` — project tests

## Rules Dashboard

Latest bundle: https://TERO-AI2509.github.io/iberitax/

[![Publish Rules Dashboard](https://github.com/TERO-AI2509/iberitax/actions/workflows/publish-rules-bundle.yml/badge.svg)](https://github.com/TERO-AI2509/iberitax/actions/workflows/publish-rules-bundle.yml)

## Rules Maintenance · CI

![Rules Maintenance](https://github.com/TERO-AI2509/iberitax/actions/workflows/rules-maintenance.yml/badge.svg)


## Admin / Maintenance

Use the main CLI with the `admin` subcommand:

```
node scripts/modelo100.cli.mjs admin owners
node scripts/modelo100.cli.mjs admin stale
node scripts/modelo100.cli.mjs admin map-health --out artifacts/modelo100/health.report.json
```
