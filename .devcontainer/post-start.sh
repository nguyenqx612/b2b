#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE="docker compose -f docker-compose.yml -f .devcontainer/docker-compose.devcontainer.yml"

node .devcontainer/configure-env.js
$COMPOSE up -d postgres redis minio minio-init
