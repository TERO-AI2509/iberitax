
## Phase 11 · Step 15 — Lessons Learned (2025-10-15T04:24:07Z)

- Prebuilt is king: build locally with the exact lockfile that Vercel will use, then .
- npm must be isolated in app roots for monorepos. Add  with  in  to stop workspace discovery.
- Do not hide ; Next still needs the  package if  exist, even with .
- Leave Vercel Build/Install blank so it respects  and defaults to **npm**.
- Set Root Directory to  and disable “include files outside root” to prevent monorepo crawling.
- Any  hooks that mutate deps will poison remote builds. Remove them.
- Always check:  and iberitax-mvp@0.1.0 /Users/eltjotimmerman/TERO-AI/dev/iberitax
└── (empty) under the exact working dir used by the build.
- When in doubt, extract a clean deployable app (Option B) with its own lockfile.


## Phase 11 · Step 15 — Lessons Learned (2025-10-15T04:27:58Z)

- Prebuilt is king: build locally with the exact lockfile that Vercel will use, then .
- npm must be isolated in app roots for monorepos. Add  with  in  to stop workspace discovery.
- Do not hide ; Next still needs the  package if  exist, even with .
- Leave Vercel Build/Install blank so it respects  and defaults to **npm**.
- Set Root Directory to  and disable “include files outsideact a clean deployable app (Option B) with its own lockfile.

