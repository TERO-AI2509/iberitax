#!/usr/bin/env bash
set -euo pipefail
manifest="${1:-}"
out="${2:-}"

if [[ -z "${manifest}" || -z "${out}" ]]; then
  echo "Usage: tools/make-step-bundle.sh <manifest-file> <out.zip>" >&2
  exit 1
fi
if [[ ! -f "${manifest}" ]]; then
  echo "Manifest not found: ${manifest}" >&2
  exit 1
fi

tmp="$(mktemp)"
# expand globs safely
while IFS= read -r pattern; do
  [[ -z "$pattern" || "$pattern" =~ ^# ]] && continue
  matches=$(compgen -G "$pattern" || true)
  if [[ -n "$matches" ]]; then
    # shellcheck disable=SC2086
    printf "%s\n" $matches >> "$tmp"
  else
    echo "warn: no match for: $pattern" >&2
  fi
done < "$manifest"

sort -u "$tmp" > "$tmp.sorted"
if [[ ! -s "$tmp.sorted" ]]; then
  echo "No files matched. Check your manifest patterns." >&2
  exit 1
fi

zip -r -9 "$out" -@ < "$tmp.sorted"
rm -f "$tmp" "$tmp.sorted"
echo "Wrote $out"
