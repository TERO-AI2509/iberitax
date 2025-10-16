#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3001}"
JAR="$(mktemp)"
LOG="${LOG:-smoke.log}"

mkdir -p "$(dirname "$LOG")"
: > "$LOG"

status_and_location () {
  # Prints "<code> <location>"
  curl -s -o /dev/null -D - "$1" | awk '
    BEGIN { code=""; loc="" }
    tolower($1)=="http/" { code=$2 }
    tolower($1)=="location:" { $1=""; sub(/^ /,""); loc=$0 }
    END { printf "%s %s", code, loc }
  '
}

# 1) Unauthenticated /account must redirect to /login?next=%2Faccount
read -r CODE LOC <<<"$(status_and_location "${BASE_URL}/account")"
if printf "%s" "$CODE" | grep -Eq '^30(2|7)$' && printf "%s" "$LOC" | grep -q "/login?next=%2Faccount"; then
  echo "OK: /account unauth → ${CODE} /login?next=%2Faccount" | tee -a "$LOG"
else
  echo "FAIL: /account unauth redirect missing or wrong (${CODE} ${LOC})" | tee -a "$LOG"
  exit 1
fi

# 2) /login?next=%2Faccount must forward callbackUrl to BOTH providers
login_html="$(curl -sS "${BASE_URL}/login?next=%2Faccount")"
email_ok=$(echo "$login_html" | grep -qi 'callbackurl' && echo "$login_html" | grep -q '/account' && echo ok || true)
google_ok=$(echo "$login_html" | grep -qi 'google' && echo "$login_html" | grep -q '/account' && echo ok || true)
if [ "$email_ok" = "ok" ] && [ "$google_ok" = "ok" ]; then
  echo "OK: /login forwards next to providers (Email & Google, callbackUrl=/account)" | tee -a "$LOG"
else
  echo "FAIL: /login providers missing callbackUrl=/account" | tee -a "$LOG"
  exit 1
fi

# 3) Hardening: external next must be sanitized to /dashboard
harden_html="$(curl -sS "${BASE_URL}/login?next=https://evil.com")"
if echo "$harden_html" | grep -q '/dashboard' && ! echo "$harden_html" | grep -qi 'evil.com'; then
  echo "OK: external next is sanitized to /dashboard" | tee -a "$LOG"
else
  echo "FAIL: external next not sanitized to /dashboard" | tee -a "$LOG"
  exit 1
fi
