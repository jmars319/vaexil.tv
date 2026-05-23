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

PORT="${PORT:-3203}"
BASE_URL="${BASE_URL:-http://localhost:${PORT}}"
PIDFILE="${PIDFILE:-${ROOT_DIR}/.dev-server.pid}"
LOGFILE="${LOGFILE:-${ROOT_DIR}/.dev-server.log}"
START_CMD="${START_CMD:-npm run dev}"
HEALTH_TIMEOUT_SECONDS="${HEALTH_TIMEOUT_SECONDS:-30}"
HEALTH_INTERVAL_SECONDS="${HEALTH_INTERVAL_SECONDS:-1}"
DEV_SESSION_NAME="${DEV_SESSION_NAME:-vaexil-dev-server}"

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

stop_detached_session() {
  if has_command screen; then
    screen -S "${DEV_SESSION_NAME}" -X quit >/dev/null 2>&1 || true
  fi
}

start_detached_server() {
  stop_detached_session

  if has_command screen; then
    screen -dmS "${DEV_SESSION_NAME}" bash -c '
      root_dir="$1"
      pidfile="$2"
      logfile="$3"
      port="$4"
      start_cmd="$5"
      cd "$root_dir" || exit 1
      echo $$ > "$pidfile"
      exec env PORT="$port" bash -lc "$start_cmd" >> "$logfile" 2>&1
    ' bash "${ROOT_DIR}" "${PIDFILE}" "${LOGFILE}" "${PORT}" "${START_CMD}"
  else
    (
      cd "${ROOT_DIR}"
      nohup env PORT="${PORT}" bash -lc "${START_CMD}" >"${LOGFILE}" 2>&1 < /dev/null &
      echo $! >"${PIDFILE}"
    )
  fi

  for _ in {1..50}; do
    if [[ -s "${PIDFILE}" ]]; then
      return 0
    fi
    sleep 0.1
  done

  return 1
}
