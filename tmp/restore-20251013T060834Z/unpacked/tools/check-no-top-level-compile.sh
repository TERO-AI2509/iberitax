#!/usr/bin/env bash
set -euo pipefail
# Fail if any production source file calls ajv.compile(
# (We keep it simple: forbid it anywhere in src; validators must compile lazily.)
violations=$(grep -RIn --line-number --include='*.ts' 'ajv\.compile(' packages/*/src || true)
if [[ -n "${violations}" ]]; then
  echo "❌ Disallowed ajv.compile() found in prod source files:"
  echo "${violations}"
  exit 1
fi
echo "✅ No disallowed ajv.compile() in prod source."
