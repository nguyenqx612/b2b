#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/b2b

if [[ -n "${CODESPACE_NAME:-}" ]]; then
  node .devcontainer/configure-env.js
elif [[ -f .devcontainer/.codespace-name ]]; then
  export CODESPACE_NAME="$(cat .devcontainer/.codespace-name)"
  node .devcontainer/configure-env.js
fi

rm -f /tmp/b2b-dev.pid
pkill -f concurrently 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "tsx watch" 2>/dev/null || true
sleep 2

bash .devcontainer/start-dev.sh

echo "Testing buyer login..."
curl -sf -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"thewynliving@gmail.com","password":"password123"}' | head -c 200
echo ""

echo "Testing seller login..."
curl -sf -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tamlongcraft@gmail.com","password":"password123"}' | head -c 200
echo ""
