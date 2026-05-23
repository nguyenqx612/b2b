#!/usr/bin/env bash
# Load repo .env and Codespaces env for npm/prisma commands.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

if [[ -f /home/node/.codespaces/shared/environment ]]; then
  set -a
  # shellcheck disable=SC1091
  source /home/node/.codespaces/shared/environment
  set +a
fi

exec "$@"
