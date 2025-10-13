#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
ARTDIR="$ROOT/artifacts/smoke-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$ARTDIR"
LOG="$ARTDIR/smoke.log"

cd apps/web
pnpm install --frozen-lockfile
pnpm build

lsof -ti tcp:3001 | xargs -r kill -9 || true
nohup pnpm --filter @iberitax/web exec next start -p 3001 >/dev/null 2>&1 &
PID=$!
sleep 3

set +e
BASE_URL="http://localhost:3001" LOG="$LOG" "$ROOT/apps/web/tools/smoke.portable.sh" 2>&1 | tee -a "$LOG"
STATUS=$?

curl -fsS "http://localhost:3001/dashboard" -o "$ARTDIR/dashboard.html" 2>>"$LOG" || true
curl -fsS "http://localhost:3001/billing" -o "$ARTDIR/billing.html" 2>>"$LOG" || true

kill "$PID" >/dev/null 2>&1 || true
wait "$PID" 2>/dev/null || true
lsof -ti tcp:3001 | xargs -r kill -9 || true
set -e

if [ $STATUS -ne 0 ]; then
  echo "SMOKE FAILED"
  echo "$ARTDIR"
  exit $STATUS
fi

echo "SMOKE OK"
echo "$ARTDIR"
