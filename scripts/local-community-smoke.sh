#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .dev.vars ]]; then
  echo "Create ignored .dev.vars with local Worker secrets before running this smoke test." >&2
  exit 2
fi

npm run build
persist_dir="$(mktemp -d)"
worker_pid=""
cleanup() {
  if [[ -n "$worker_pid" ]]; then kill "$worker_pid" 2>/dev/null || true; fi
  rm -rf "$persist_dir"
}
trap cleanup EXIT

npx wrangler d1 migrations apply ai-unconventional-minds-community \
  --local --config dist/server/wrangler.json --persist-to "$persist_dir"

wrangler_args=(dev --local --ip 127.0.0.1 --port 41523 \
  --config dist/server/wrangler.json --persist-to "$persist_dir")
if [[ -n "${COMMUNITY_NODE_PRELOAD:-}" ]]; then
  NODE_OPTIONS="--require=${COMMUNITY_NODE_PRELOAD}" npx wrangler "${wrangler_args[@]}" \
    > /tmp/community-wrangler.log 2>&1 &
else
  npx wrangler "${wrangler_args[@]}" > /tmp/community-wrangler.log 2>&1 &
fi
worker_pid=$!

ready=0
for attempt in {1..30}; do
  if curl -fsS http://127.0.0.1:41523/api/community/categories >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
if [[ "$ready" != 1 ]]; then
  cat /tmp/community-wrangler.log
  exit 1
fi

python scripts/local-community-smoke.py
