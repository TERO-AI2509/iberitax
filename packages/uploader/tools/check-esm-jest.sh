#!/usr/bin/env bash
set -euo pipefail
self_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
try_repo="$(cd "$self_dir/../.." && pwd)"
root="$try_repo"
if [ ! -f "$root/tools/check-esm-jest.sh" ]; then
  if command -v git >/dev/null 2>&1; then
    root="$(git -C "$self_dir" rev-parse --show-toplevel 2>/dev/null || echo "$try_repo")"
  fi
fi
if [ ! -f "$root/tools/check-esm-jest.sh" ]; then
  echo "Cannot find repo-root/tools/check-esm-jest.sh" >&2
  exit 1
fi
exec "$root/tools/check-esm-jest.sh" "$@"
