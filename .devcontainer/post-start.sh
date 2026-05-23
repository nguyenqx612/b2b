#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.yml -f .devcontainer/docker-compose.devcontainer.yml"

node .devcontainer/configure-env.js
$COMPOSE up -d postgres redis minio minio-init

echo "Waiting for Postgres..."
for i in {1..30}; do
  if $COMPOSE exec -T postgres pg_isready -U b2b -d b2b_dev >/dev/null 2>&1; then
    break
  fi
  sleep 2
done
