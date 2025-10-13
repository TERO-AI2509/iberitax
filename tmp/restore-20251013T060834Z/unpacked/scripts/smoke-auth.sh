#!/usr/bin/env sh
set -e
BASE_URL="${1:-http://127.0.0.1:3000}"
COOKIE_JAR="${2:-/tmp/ibx.cookies}"
rm -f "$COOKIE_JAR"
curl -fsS "$BASE_URL/api/public/ping"
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/private/whoami")
echo "$code"
curl -s -i "$BASE_URL/api/private/whoami" | sed -n '1,10p'
