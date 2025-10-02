
## 2025-09-28 — Phase 02 Step 09 Completed
Deliverables:
- Browser PUT with progress (`putFile`) in @iberitax/uploader.
- `/upload` wired to initUpload → putFile with live progress and success summary.
- Unit test for putFile (Node/fetch path).
- Client-only import path via subpath export (`@iberitax/uploader/client`).
- Jest/preflight wiring stable; TypeScript build passing.

Acceptance:
- pnpm -C apps/web dev boots, /upload shows progress and success summary.
- pnpm -C packages/uploader test is green.
- No server code pulled into browser bundles.

## Lessons Learned (do this from the start)

1) Client/server split for shared packages
- Never import a package root that re-exports server modules from browser code.
- Provide a client-only subpath export:
  - packages/uploader/package.json → "exports": { "./client": "./dist/client.js" }
  - Web code imports from "@iberitax/uploader/client".

2) DOM globals in Node tests
- Do not reference DOM globals by identifier in shared code.
- Use guarded access:
  - if (typeof (globalThis as any).XMLHttpRequest !== "undefined") { const xhr = new (globalThis as any).XMLHttpRequest(); }
- Provide Node/test fallback (fetch) without DOM types.
- In tests, if TS infers unknown, annotate or locally cast.

3) Preflight + Jest
- Prefer separate scripts rather than chaining inline with shell quoting:
  - "pretest": "tools/check-esm-jest.sh"
  - "test": "jest --config jest.config.cjs"
- If a package needs a stable path to the root script, add a wrapper at packages/<pkg>/tools/check-esm-jest.sh that resolves repo root and execs the root script.
- Avoid fragile shell quoting in jq updates; perform two discrete jq edits when needed.

4) Next.js bundling
- Any server dependency (fs, express, send) must not leak into client bundles.
- Ensure the browser code imports only client surfaces (see 1).

5) CI predictability
- Keep preflight null-safe: jq checks must not fail when fields are missing.
- Tests should run even if workspace metadata is absent.

## Known pitfalls to avoid
- Do not use applypatch in instructions or scripts.
- Do not chain commands inside JSON with complex quotes; prefer separate lifecycle scripts or a local wrapper.
- Do not rely on global DOM libs in TypeScript builds for shared packages.

## Phase 02 Remaining Steps
- Step 10: Shareable download URL on success, UI copy button, tests.
- Step 11: User-friendly errors, simple retry, basic validation, tests.
- Step 12: UX polish (disable/cancel), a11y pass, final test sweep.

