#!/usr/bin/env bash
set -euo pipefail

# Keep local overrides in a gitignored copy so every dev script reads the same ports and logs.
PORT=3203
BASE_URL="http://localhost:${PORT}"
PIDFILE="${PWD}/.dev-server.pid"
LOGFILE="${PWD}/.dev-server.log"
START_CMD="npm run dev"
HEALTH_TIMEOUT_SECONDS=30
HEALTH_INTERVAL_SECONDS=1

# Keep browser choice configurable because teammates may run the same scripts on macOS or Windows.
DEV_BROWSER_OPEN=1
DEV_BROWSER=safari
