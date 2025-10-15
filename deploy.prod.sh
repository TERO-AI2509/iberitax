#!/usr/bin/env bash
set -euo pipefail
: "${VM_USER:?}"; : "${VM_HOST:?}"; : "${BUNDLE:=bundle.tar.gz}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
ssh -o StrictHostKeyChecking=accept-new "$VM_USER@$VM_HOST" 'sudo mkdir -p /opt/iberitax/releases /opt/iberitax/shared/logs /opt/iberitax/shared/env && sudo chown -R $USER: /opt/iberitax'
scp "$BUNDLE" "$VM_USER@$VM_HOST:/opt/iberitax/releases/$TS.tar.gz"
ssh "$VM_USER@$VM_HOST" "
  set -euo pipefail
  cd /opt/iberitax/releases
  mkdir -p $TS && tar -xzf $TS.tar.gz -C $TS
  ln -sfn /opt/iberitax/releases/$TS /opt/iberitax/current
  if systemctl is-enabled iberitax-web.service >/dev/null 2>&1; then sudo systemctl restart iberitax-web.service; fi
"
echo "OK 11.15.deploy"
