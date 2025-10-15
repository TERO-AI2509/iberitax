
Runbook Update — 2025-10-14
Phase 11 · Steps 11.10 → 11.14 Summary
- Owner enrichment → Lawyer Dashboard → Auth → Scheduling → Cloud Prep complete.
- macOS dev runners OK; cloud migration planned (launchd agents to be removed).
- VM layout, TLS/DNS prep, GitHub Environments, and scheduler jobs ready.
- Next step: Phase 11 · Step 11.15 — Cloud Deploy Execution + DNS + TLS.
OK 11.14.runbook.update

## Phase 11 — Vercel Deploy Isolation (2025-10-15)

### Summary
We stabilized production by isolating deploys to a standalone app root (`apps/web.deploy`) and using prebuilt deployments with an explicit alias. Root causes were (1) Vercel project root mis-scoping, (2) npm workspace leakage, and (3) protection-induced 401s.

### What changed
- New prod island: `apps/web.deploy` (Next.js 14, minimal pages, own `.npmrc` with `workspaces=false`)
- New Vercel project: `iberitax-web-deploy` (root = `apps/web.deploy`)
- Prebuilt flow: `vercel build --prod` → `vercel deploy --prebuilt --prod`
- Alias: `iberitax-web.vercel.app → <latest deploy>`

### Canonical flow (Option B)
1. From `apps/web.deploy`  
   `npm ci && npm run build`
2. `vercel link` (project = `iberitax-web-deploy`, root = `.`)
3. `vercel pull --environment=production`
4. `vercel build --prod`
5. `vercel deploy --prebuilt --prod` → capture URL
6. `vercel alias "<URL>" "iberitax-web.vercel.app"`
7. Verify: `curl -s -o /dev/null -w "%{http_code}\n" "<URL>/lawyer"` → `200`

### Guardrails
- Each app root has its **own** `.vercel/` (never share project IDs between folders).
- Vercel Project Settings (for the active project):
  - Root Directory = app root
  - Include files outside root = Disabled
  - Build/Install = empty (defaults to npm)
  - Deployment Protection = Disabled (for public prod)
- npm isolation: `.npmrc` with `workspaces=false` **inside the app root**.
- Prebuilt is king: local `vercel build` must be green before `vercel deploy --prebuilt`.

### Troubleshooting
- 404 after alias: URL mismatch or alias to old deployment. Re-alias to the latest printed URL.
- 401 on public routes: Vercel protection is on. Disable “Vercel Authentication” for the project.
- Module resolution errors only in `vercel build`: confirm app root is linked to the correct project (`vercel link`, answer `.` to “In which directory is your code located?”).

### Artifacts to save
- `artifacts/step15.deploy.url.txt` (the final deployment URL)
- `artifacts/step15.httpcode.lawyer.txt` (should contain `200`)
- Optional: final zip + manifest (see Finalization one-liner)

