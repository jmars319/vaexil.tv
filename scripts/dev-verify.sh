#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/script-utils.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/dev-common.sh"

log_info "Running dev stack smoke test."

"${SCRIPT_DIR}/dev-start.sh"

if has_command curl; then
  log_info "Checking ${BASE_URL}/"
  curl -fsS "${BASE_URL}/" >/dev/null

  log_info "Checking ${BASE_URL}/robots.txt"
  curl -fsS "${BASE_URL}/robots.txt" >/dev/null

  log_info "Checking ${BASE_URL}/sitemap.xml"
  curl -fsS "${BASE_URL}/sitemap.xml" >/dev/null
else
  log_warn "curl not found; skipping HTTP checks."
fi

"${SCRIPT_DIR}/dev-stop.sh"

log_success "Dev smoke test complete."
