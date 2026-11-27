#!/usr/bin/env bash
# The image as deployed: compose.yaml, then the pages, the Markdown twins, the
# registry's CORS and the redirects. ci runs it with the image loaded as
# ghcr.io/zyx-tw/ui:ci.
set -euo pipefail
trap 'docker compose logs; docker compose down -v' EXIT
sed -e 's/^UI_VERSION=.*/UI_VERSION=ci/' -e 's/^UI_BIND=.*/UI_BIND=127.0.0.1:3999/' .env.example > .env
docker compose up -d --wait web
base=http://127.0.0.1:3999
code() { curl -s -o /dev/null -w "%{http_code}" "$base$1"; }
for path in / /button /button.md /index.md /llms.txt /r/base.json /fonts/maple-mono-nf-cn.css /fonts/sarasa-mono-tc.css /icon.svg; do
  echo "$path $(code "$path")"
  test "$(code "$path")" = 200
done
test "$(code /nope-not-a-page)" = 404
curl -sI "$base/button.md" | grep -qi '^content-type: text/markdown'
curl -sI "$base/r/base.json" | grep -qi '^access-control-allow-origin: \*'
test "$(code /button.html)" = 308
test "$(code /button/)" = 308
# Crafted paths must never redirect off the host.
for path in /%5Cevil.com.html /%09/evil.com.html /%5Cevil.com/; do
  location=$(curl -s -o /dev/null -w "%{redirect_url}" "$base$path")
  echo "$path -> $location"
  case "$location" in "" | "$base"/*) ;; *) exit 1 ;; esac
done
echo smoke ok
