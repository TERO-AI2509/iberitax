#!/usr/bin/env bash
set -e
base="http://127.0.0.1:3000"
out=$(curl -sS -i "$base/dashboard" | sed -n '1,10p')
echo "$out" | grep -E '^HTTP/1.1 307'
echo "$out" | grep 'location: /login?reason=expired&next=%2Fdashboard'
out2=$(curl -sS -i "$base/api/private/_diag" | sed -n '1,5p' || true)
echo "ok"

echo "[smoke] whoami with expiringSoon=1"
curl -sS "http://127.0.0.1:3000/api/private/whoami?expiringSoon=1" | jq -r '.data.expiringSoon'

echo "[smoke] whoami normal"
curl -sS "http://127.0.0.1:3000/api/private/whoami" | jq -r '.data.expiringSoon'

echo "[smoke] whoami with expiringSoon=1"
curl -sS "http://127.0.0.1:3000/api/private/whoami?expiringSoon=1" | jq -r '.data.expiringSoon'

echo "[smoke] whoami normal"
curl -sS "http://127.0.0.1:3000/api/private/whoami" | jq -r '.data.expiringSoon'

echo "[smoke] refresh then whoami"
curl -sS -X POST "http://127.0.0.1:3000/api/private/refresh" | jq -r '.data.expiringSoon'
curl -sS "http://127.0.0.1:3000/api/private/whoami" | jq -r '.data.expiringSoon'
curl -s -i "http://localhost:3000/billing" | sed -n "1,5p" | tee /dev/stderr | grep -q " 307 " || exit 1
curl -s -i -c /tmp/ibx.cookies "http://localhost:3000/api/dev-login" >/dev/null
curl -s -i -b /tmp/ibx.cookies "http://localhost:3000/billing" | sed -n "1,5p" | tee /dev/stderr | grep -q " 200 " || exit 1
curl -s -i -c /tmp/ibx.cookies "http://localhost:3000/api/dev-login?user=demo" >/dev/null
curl -s -b /tmp/ibx.cookies -X POST "http://localhost:3000/api/checkout/placeholder" | grep -q '"ok":true' || { echo "FAIL: checkout placeholder"; exit 1; }
curl -s -i -c /tmp/ibx.cookies "http://localhost:3000/api/dev-login?user=demo" >/dev/null
curl -s -b /tmp/ibx.cookies -X POST "http://localhost:3000/api/checkout/placeholder" | grep -q '"ok":true' || { echo "FAIL: checkout placeholder"; exit 1; }
RES=$(curl -s -X POST http://localhost:3000/api/checkout/create -H "Cookie: dev-auth=1")
echo "$RES" | grep -q '"ok":true'
echo "$RES" | grep -q 'checkout.stripe.com'

echo "[smoke] billing return pages"
curl -s -i -b /tmp/ibx.cookies "http://localhost:3000/billing?stripe=success" | sed -n "1,5p" | grep -q " 200 " || exit 1
curl -s -b /tmp/ibx.cookies "http://localhost:3000/billing?stripe=success" | grep -qi "Payment confirmed" || exit 1
curl -s -b /tmp/ibx.cookies "http://localhost:3000/billing?stripe=cancelled" | grep -qi "Payment canceled" || exit 1
