#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

CONFIG_FILE="${SCRIPT_DIR}/dev-config.sh"
DEFAULT_CONFIG_FILE="${SCRIPT_DIR}/dev-config.example.sh"

if [[ -f "${CONFIG_FILE}" ]]; then
  # shellcheck source=/dev/null
  source "${CONFIG_FILE}"
fi

PORT="${PORT:-3000}"
BASE_URL="${BASE_URL:-http://localhost:${PORT}}"
PIDFILE="${PIDFILE:-${ROOT_DIR}/.dev-server.pid}"
LOGFILE="${LOGFILE:-${ROOT_DIR}/.dev-server.log}"
START_CMD="${START_CMD:-npm run dev}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-30}"
HEALTH_INTERVAL_SECONDS="${HEALTH_INTERVAL_SECONDS:-1}"

has_command() {
  command -v "$1" >/dev/null 2>&1
}

wait_for_url() {
  local url="$1"
  local timeout="$2"
  local interval="$3"
  local elapsed=0

  if ! has_command curl; then
    return 2
  fi

  while (( elapsed < timeout )); do
    if curl -fsS "${url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep "${interval}"
    elapsed=$((elapsed + interval))
  done

  return 1
}
