#!/usr/bin/env bash
# Run inside Codespace terminal (e.g. vigilant-space-lamp) to pull latest and start HarborLane.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== Pull latest (includes auto-start devcontainer scripts) ==="
git pull origin master

echo "=== Configure Codespaces URLs ==="
node .devcontainer/configure-env.js

echo "=== Start infra ==="
docker compose -f docker-compose.yml -f .devcontainer/docker-compose.devcontainer.yml up -d postgres redis minio minio-init

echo "=== DB migrate + seed (safe to re-run) ==="
npm run db:migrate
npm run db:seed

echo "=== Start API + web ==="
bash .devcontainer/start-dev.sh

sleep 3
if curl -sf http://localhost:3001/health >/dev/null; then
  echo "API OK: http://localhost:3001/health"
else
  echo "API not ready yet — check: tail -f /tmp/b2b-dev.log"
fi

CS_NAME="${CODESPACE_NAME:-unknown}"
CS_DOMAIN="${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-app.github.dev}"
echo ""
echo "Open in browser:"
echo "  Web: https://${CS_NAME}-3000.${CS_DOMAIN}"
echo "  API: https://${CS_NAME}-3001.${CS_DOMAIN}/health"
