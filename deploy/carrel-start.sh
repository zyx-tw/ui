#!/bin/sh
# carrel-deployd (from land) runs this from the release directory on every
# deploy and rollback: it moves /opt/ui to the release in VERSION, reports
# ready once the container is healthy, then follows its logs. The unit needs
# Type=notify and NotifyAccess=all.
set -eu

version=$(cat VERSION)
if [ -f compose.yaml ]; then
  cp compose.yaml /opt/ui/compose.yaml.new
  mv /opt/ui/compose.yaml.new /opt/ui/compose.yaml
fi
cd /opt/ui

tmp=$(mktemp .env.XXXXXX)
grep -v '^UI_VERSION=' .env >"$tmp" || true
echo "UI_VERSION=$version" >>"$tmp"
chmod 600 "$tmp"
mv "$tmp" .env

for try in 1 2 3; do
  docker compose pull --quiet web && break
  [ "$try" = 3 ] && exit 1
  sleep 2
done
docker compose up -d --wait web
systemd-notify --ready
exec docker compose logs -f --since 1s web
