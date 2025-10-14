#!/usr/bin/env bash
set -e
ROOT="${ROOT:-$HOME/TERO-AI/dev/iberitax}"
cd "$ROOT"

mkdir -p artifacts/env
[ -f artifacts/env/.env.production.web.example ] || cat > artifacts/env/.env.production.web.example <<'EOF'
NODE_ENV=production
PORT=3000
LAWYER_API_BASE=http://localhost:8787
NEXTAUTH_SECRET=replace_me
NEXTAUTH_URL=https://your.domain.example
STRIPE_SECRET_KEY=replace_me
STRIPE_PRICE_ID=price_xxx
EOF

[ -f artifacts/env/.env.production.stub.example ] || cat > artifacts/env/.env.production.stub.example <<'EOF'
NODE_ENV=production
PORT=8787
LAWYER_POST_SECRET=replace_me
EOF

mkdir -p attic/step11.14-clean
git ls-files 'apps/stub-server/routes/*' | xargs -I{} git mv {} attic/step11.14-clean/ 2>/dev/null || true
git ls-files '*/*.bak*' '*/*.backup*' '*/*.back*' | xargs -I{} git mv {} attic/step11.14-clean/ 2>/dev/null || true
git ls-files 'apps/web/apps/web/*' | xargs -I{} git mv {} attic/step11.14-clean/ 2>/dev/null || true

APPEND_LINES="
apps/web/dev.db
apps/web/prisma/dev.db
tmp/
artifacts/backups/
artifacts/*.html
artifacts/*.json
"
touch .gitignore
while IFS= read -r line; do
  [ -z "$line" ] && continue
  grep -qxF "$line" .gitignore || printf "%s\n" "$line" >> .gitignore
done <<EOF
$APPEND_LINES
EOF

git rm -f --cached apps/web/dev.db apps/web/prisma/dev.db 2>/dev/null || true
git rm -f --cached -r tmp artifacts/backups 2>/dev/null || true

WARN=0
if git ls-files | grep -q '^apps/stub-server/routes/'; then echo "WARN legacy routes still tracked"; WARN=1; fi
if git ls-files | grep -q '^apps/web/apps/web/'; then echo "WARN nested web path still tracked"; WARN=1; fi
if git ls-files | grep -qE '(\.bak|\.backup)'; then echo "WARN backup files still tracked"; WARN=1; fi
if git ls-files | grep -qE '^tmp/|^artifacts/backups/'; then echo "WARN tmp or backups still tracked"; WARN=1; fi
if git ls-files | grep -qE 'apps/web/(dev\.db|prisma/dev\.db)'; then echo "WARN local DBs still tracked"; WARN=1; fi

if [ $WARN -eq 0 ]; then
  echo "OK 11.14.sanitize.audit"
else
  echo "OK 11.14.sanitize.audit.with.warnings"
fi

echo "OK 11.14.sanitize.done"
