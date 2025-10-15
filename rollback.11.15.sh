#!/usr/bin/env bash
set -euo pipefail
: "${VM_USER:?}"; : "${VM_HOST:?}"
ssh "$VM_USER@$VM_HOST" '
set -euo pipefail
cd /opt/iberitax/releases
PREV="$(ls -1dt */ | sed -n "2p" | tr -d "/")"
test -n "$PREV"
ln -sfn "/opt/iberitax/releases/$PREV" /opt/iberitax/current
sudo systemctl restart iberitax-web.service || true
'
echo "OK 11.15.rollback.symlink"
