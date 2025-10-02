#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo"

label="${1:-02-10}"
shift || true

case "$label" in
  [0-9][0-9]-[0-9][0-9])
    phase="${label%-*}"
    step="${label#*-}"
    outname="iberitax-phase${phase}-step${step}"
    ;;
  *)
    outname="iberitax-${label}"
    ;;
esac

dest="${HOME}/Desktop"
ts="$(date +%Y%m%d-%H%M%S)"
zipfile="${dest}/${outname}-${ts}.zip"

tmp_all="$(mktemp)"
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
  for extra in "$@"; do
    echo "$extra"
  done
} > "$tmp_all"

tmp_exist="$(mktemp)"
while IFS= read -r path; do
  [ -e "$path" ] && echo "$path"
done < "$tmp_all" > "$tmp_exist"

mkdir -p "$dest"
if [ -s "$tmp_exist" ]; then
  zip -r -@ "$zipfile" < "$tmp_exist" >/dev/null
else
  echo "No files found to include."
  rm -f "$tmp_all" "$tmp_exist"
  exit 1
fi

rm -f "$tmp_all" "$tmp_exist"
echo "✅ Bundle created: $zipfile"
