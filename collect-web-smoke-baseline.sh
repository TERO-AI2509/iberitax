#!/usr/bin/env bash
set -euo pipefail

# Usage: ./collect-web-smoke-baseline.sh [BRANCH] [SAMPLES] [OUTDIR]
BRANCH="${1:-main}"
SAMPLES="${2:-5}"
OUTDIR="${3:-artifacts-baseline}"

mkdir -p "$OUTDIR"

echo "→ Finding latest $SAMPLES successful runs on branch '$BRANCH'..."
RUN_IDS=($(gh run list --branch "$BRANCH" --limit 40 --json databaseId,conclusion \
  --jq '[.[] | select(.conclusion=="success") | .databaseId][0:'"$SAMPLES"'] | .[]'))

if [ ${#RUN_IDS[@]} -eq 0 ]; then
  echo "No successful runs found on branch '$BRANCH'." >&2
  exit 1
fi

echo "→ Downloading artifacts (web_smoke_total_seconds.txt) for runs: ${RUN_IDS[*]}"
for id in "${RUN_IDS[@]}"; do
  gh run download "$id" --pattern "web_smoke_total_seconds.txt" --dir "$OUTDIR" >/dev/null 2>&1 || true
done

# Consolidate timings
echo "→ Collecting timings..."
grep -h -R '^[0-9]\+$' "$OUTDIR" > timings.txt || true
if [ ! -s timings.txt ]; then
  echo "No timing files found in $OUTDIR (did the runs upload artifacts?)." >&2
  exit 1
fi

# Sort & compute stats
sort -n timings.txt -o timings.txt
COUNT=$(wc -l < timings.txt | tr -d ' ')
MIN=$(head -1 timings.txt)
MAX=$(tail -1 timings.txt)
MEDIAN=$(awk '{a[NR]=$1} END{if (NR%2) print a[(NR+1)/2]; else print (a[NR/2]+a[NR/2+1])/2}' timings.txt)

# Save CSV
echo "seconds" > baseline.csv
cat timings.txt >> baseline.csv

echo "→ Results"
echo "Samples: $COUNT"
echo "Min:     ${MIN}s"
echo "Max:     ${MAX}s"
echo "Median:  ${MEDIAN}s"
echo "CSV:     baseline.csv"
