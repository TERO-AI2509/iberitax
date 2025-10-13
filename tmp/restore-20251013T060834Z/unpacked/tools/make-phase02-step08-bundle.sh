#!/usr/bin/env bash
set -euo pipefail

repo="${1:-/Users/eltjotimmerman/TERO-AI/dev/iberitax}"
outname="${2:-iberitax-phase02-step08-debug}"
dest="${3:-$HOME/Desktop}"

ts="$(date +%Y%m%d-%H%M%S)"
zipfile="$dest/${outname}-${ts}.zip"

cd "$repo"

tmp="$(mktemp)"
add_glob () {
  local pattern="$1"; local found=0
  # shellcheck disable=SC2086
  for f in $pattern; do
    if [ -e "$f" ]; then
      echo "$f" >> "$tmp"; found=1
    fi
  done
  if [ $found -eq 0 ]; then
    echo "warn: no match for: $pattern" >&2
  fi
}
adds () { for p in "$@"; do add_glob "$p"; done; }

# Root configs
adds package.json pnpm-workspace.yaml pnpm-lock.yaml \
     tsconfig.json tsconfig.jest.json jest.base-esm.cjs \
     tools/check-esm-jest.sh

# Uploader package
adds packages/uploader/package.json \
     packages/uploader/jest.config.cjs \
     packages/uploader/tsconfig.json \
     packages/uploader/tsconfig.jest.json \
     "packages/uploader/src/**" \
     "packages/uploader/tests/**"

# Stub server (uploader routes)
adds apps/stub-server/package.json \
     apps/stub-server/.env.example \
     "apps/stub-server/src/**"

# Web app (upload page)
adds apps/web/package.json \
     "apps/web/next.config.*" \
     apps/web/README.md \
     apps/web/app/upload/page.tsx \
     apps/web/pages/upload.tsx \
     "apps/web/app/api/**" \
     "apps/web/src/**"

# Summarize + zip
sort -u "$tmp" > "$tmp.list"
echo "Included files:" > ".phase02-step08.manifest.txt"
cat "$tmp.list" >> ".phase02-step08.manifest.txt"

mkdir -p "$dest"
# Create zip from list (preserves paths)
zip -r -@ "$zipfile" < "$tmp.list" >/dev/null
# Also include the manifest and this script
zip -j "$zipfile" ".phase02-step08.manifest.txt" "$0" >/dev/null

echo "✅ Bundle created: $zipfile"
echo "   Count: $(wc -l < "$tmp.list") files"

rm -f "$tmp" "$tmp.list" ".phase02-step08.manifest.txt"
