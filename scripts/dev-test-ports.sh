#!/usr/bin/env bash

SCRIPT_DIR="${SCRIPT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)}"
ROOT_DIR="${ROOT_DIR:-$(cd "${SCRIPT_DIR}/.." && pwd)}"

export PORT="${PORT:-4203}"
export BASE_URL="${BASE_URL:-http://localhost:${PORT}}"
export PIDFILE="${PIDFILE:-${ROOT_DIR}/.dev/test-server.pid}"
export LOGFILE="${LOGFILE:-${ROOT_DIR}/.dev/test-server.log}"
export DEV_SESSION_NAME="${DEV_SESSION_NAME:-vaexil-test-server}"
export DEV_BROWSER_OPEN="${DEV_BROWSER_OPEN:-0}"

mkdir -p "$(dirname "${PIDFILE}")" "$(dirname "${LOGFILE}")"
