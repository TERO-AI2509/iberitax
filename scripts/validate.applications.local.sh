#!/usr/bin/env bash
set -euo pipefail
ts=$(date -Iseconds)
log="artifacts/cron/validate-$ts.log"
node scripts/validate.applications.mjs > "$log" 2>&1
echo "OK 11.5.application" | tee -a "$log"
