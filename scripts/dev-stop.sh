#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/script-utils.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/dev-common.sh"

if [[ ! -f "${PIDFILE}" ]]; then
  log_warn "No pidfile found; dev server not running."
  exit 0
fi

server_pid="$(cat "${PIDFILE}" 2>/dev/null || true)"
if [[ -z "${server_pid}" ]]; then
  log_warn "Pidfile empty; removing."
  rm -f "${PIDFILE}"
  exit 0
fi

if ! kill -0 "${server_pid}" >/dev/null 2>&1; then
  log_warn "Process ${server_pid} not running; removing pidfile."
  rm -f "${PIDFILE}"
  exit 0
fi

log_info "Stopping dev server (pid ${server_pid})."
kill "${server_pid}" >/dev/null 2>&1 || true

for _ in {1..15}; do
  if ! kill -0 "${server_pid}" >/dev/null 2>&1; then
    rm -f "${PIDFILE}"
    log_success "Dev server stopped."
    exit 0
  fi
  sleep 1
done

log_warn "Dev server still running; sending SIGKILL."
kill -9 "${server_pid}" >/dev/null 2>&1 || true
rm -f "${PIDFILE}"
log_success "Dev server force-stopped."
