#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PID_FILE="/tmp/b2b-dev.pid"
LOG_FILE="/tmp/b2b-dev.log"
COMPOSE="docker compose -f docker-compose.yml -f .devcontainer/docker-compose.devcontainer.yml"

if curl -sf http://localhost:3001/health >/dev/null 2>&1; then
  echo "Dev servers already responding. Log: $LOG_FILE"
  exit 0
fi

echo "Waiting for Postgres..."
for i in {1..30}; do
  if $COMPOSE exec -T postgres pg_isready -U b2b -d b2b_dev >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

node .devcontainer/configure-env.js

if [[ -f "$PID_FILE" ]]; then
  old_pid="$(cat "$PID_FILE")"
  kill "$old_pid" 2>/dev/null || true
fi

nohup npm run dev >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

for i in {1..60}; do
  if curl -sf http://localhost:3001/health >/dev/null 2>&1; then
    echo "Dev servers ready (pid $(cat "$PID_FILE")). Log: $LOG_FILE"
    exit 0
  fi
  sleep 2
done

echo "Dev servers failed to start. Last log lines:"
tail -30 "$LOG_FILE" || true
exit 1
