#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/script-utils.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/dev-common.sh"

if [[ -f "${PIDFILE}" ]]; then
  existing_pid="$(cat "${PIDFILE}" 2>/dev/null || true)"
  if [[ -n "${existing_pid}" ]] && kill -0 "${existing_pid}" >/dev/null 2>&1; then
    log_warn "Dev server already running (pid ${existing_pid})."
    exit 0
  fi
fi

log_info "Starting dev server with: ${START_CMD}"

(
  cd "${ROOT_DIR}"
  nohup ${START_CMD} >"${LOGFILE}" 2>&1 &
  echo $! >"${PIDFILE}"
)

server_pid="$(cat "${PIDFILE}" 2>/dev/null || true)"
if [[ -z "${server_pid}" ]]; then
  die "Failed to record dev server pid."
fi

wait_result=0
wait_for_url "${BASE_URL}" "${HEALTH_TIMEOUT_SECONDS}" "${HEALTH_INTERVAL_SECONDS}" || wait_result=$?

if [[ "${wait_result}" -eq 2 ]]; then
  log_warn "curl not found; skipped health check for ${BASE_URL}."
elif [[ "${wait_result}" -ne 0 ]]; then
  log_error "Dev server did not become ready within ${HEALTH_TIMEOUT_SECONDS}s."
  log_error "Check logs at ${LOGFILE}."
  exit 1
fi

log_success "Dev server ready at ${BASE_URL} (pid ${server_pid})."
