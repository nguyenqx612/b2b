#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.yml -f .devcontainer/docker-compose.devcontainer.yml"

echo "=== Configuring environment ==="
node .devcontainer/configure-env.js

echo "=== Installing dependencies ==="
npm install

echo "=== Generating Prisma client ==="
npm run db:generate

echo "=== Building workspace packages ==="
bash .devcontainer/with-env.sh npm run build --workspace=packages/shared
bash .devcontainer/with-env.sh npm run build --workspace=packages/db

echo "=== Starting infra (postgres, redis, minio) ==="
$COMPOSE up -d postgres redis minio minio-init

echo "=== Waiting for Postgres ==="
for i in {1..30}; do
  if $COMPOSE exec -T postgres pg_isready -U b2b -d b2b_dev >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "=== Running migrations and seed ==="
bash .devcontainer/with-env.sh npm run db:migrate
bash .devcontainer/with-env.sh npm run db:seed

echo ""
echo "HarborLane Codespace ready."
echo "  Run: npm run dev"
echo "  Web: port 3000  |  API: port 3001  |  MinIO console: port 9001"
echo "  Open forwarded URLs from the Ports tab (set 3000/3001 to Public)."
