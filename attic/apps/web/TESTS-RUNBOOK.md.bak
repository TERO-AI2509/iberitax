# Web App Tests – Golden Runbook

## Bootstrap
1. Install dev deps:
   pnpm -w add -D whatwg-fetch undici babel-jest @babel/preset-env @babel/preset-react @babel/preset-typescript

2. Ensure these files exist:
   - apps/web/jest.config.cjs
   - apps/web/jest.setup.cjs
   - apps/web/babel.config.cjs
   - apps/web/__mocks__/styleMock.js
   - apps/web/__mocks__/fileMock.js

3. Run:
   pnpm --filter @iberitax/web test

## Golden prompt
Fix Jest so "@/..." resolves from apps/web, jsdom and node tests have fetch/Request/Response available, and ESM-only deps (jose, openid-client, next-auth) are transpiled by babel-jest. Keep babel config (env + react automatic + ts) and add whatwg-fetch + undici polyfills in jest.setup. Update jest.config with moduleNameMapper '^@/(.*)$' -> '<rootDir>/$1' and transformIgnorePatterns for ESM deps.

## Notes
Use /** @jest-environment node */ on tests that require Node environment.
