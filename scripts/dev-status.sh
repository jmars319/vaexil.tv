#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/script-utils.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/dev-common.sh"

if [[ -f "${PIDFILE}" ]]; then
  server_pid="$(cat "${PIDFILE}" 2>/dev/null || true)"
  if [[ -n "${server_pid}" ]] && kill -0 "${server_pid}" >/dev/null 2>&1; then
    log_success "Dev server running (pid ${server_pid})."
  else
    log_warn "Pidfile present but process not running."
  fi
else
  log_warn "Dev server not running."
fi

if has_command lsof; then
  if lsof -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
    log_success "Port ${PORT} is listening."
  else
    log_warn "Port ${PORT} not listening."
  fi
else
  log_warn "lsof not available; skipped port check."
fi
