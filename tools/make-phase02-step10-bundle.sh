#!/usr/bin/env bash
set -euo pipefail
repo="$(cd "$(dirname "$0")/.." && pwd)"
outname="iberitax-phase02-step10"
dest="$HOME/Desktop"
ts="$(date +%Y%m%d-%H%M%S)"
zipfile="$dest/${outname}-${ts}.zip"

cd "$repo"
tmp="$(mktemp)"
{
  echo package.json
  echo pnpm-workspace.yaml
  echo tools/check-esm-jest.sh
  echo docs/RUNBOOK.md
  echo apps/web/app/upload/page.tsx
  echo apps/stub-server/src/index.mjs
  echo packages/uploader/package.json
  echo packages/uploader/src/client.ts
  echo packages/uploader/src/index.ts
  echo packages/uploader/tests/client.putFile.test.ts
} > "$tmp"

mkdir -p "$dest"
zip -r -@ "$zipfile" < "$tmp" >/dev/null
rm -f "$tmp"

echo "✅ Bundle created: $zipfile"
