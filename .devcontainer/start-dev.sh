#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

PID_FILE="/tmp/b2b-dev.pid"
LOG_FILE="/tmp/b2b-dev.log"

if [[ -f "$PID_FILE" ]]; then
  old_pid="$(cat "$PID_FILE")"
  if kill -0 "$old_pid" 2>/dev/null; then
    echo "Dev servers already running (pid $old_pid). Log: $LOG_FILE"
    exit 0
  fi
fi

node .devcontainer/configure-env.js
nohup npm run dev >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"
echo "Started npm run dev (pid $(cat "$PID_FILE")). Log: $LOG_FILE"
