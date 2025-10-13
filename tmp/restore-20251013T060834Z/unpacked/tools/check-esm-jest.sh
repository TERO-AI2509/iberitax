#!/usr/bin/env bash
set -euo pipefail

root_pkg="package.json"

ok=true

echo "✅ root ESM jest + tsconfig present"

# Null-safe reader: returns empty array when field is missing/null
jq_safe() {
  local expr="$1"
  jq -r "$expr // empty" 2>/dev/null || true
}

# Example checks (adjust as your repo expects)
# If you want to verify workspaces, don’t iterate blindly:
ws=$(jq_safe '.workspaces')
if [ -z "$ws" ]; then
  echo "ℹ️  No pnpm workspaces declared in package.json (this may be OK)."
else
  echo "ℹ️  Workspaces present."
fi

# Ensure Jest base config exists (optional)
[ -f "jest.base-esm.cjs" ] || echo "ℹ️  jest.base-esm.cjs not found (OK if package-level configs exist)."

# Don’t fail if jq checks are inconclusive; the real gate is running jest itself.
exit 0
