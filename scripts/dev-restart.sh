#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/script-utils.sh"

log_info "Restarting dev server."
"${SCRIPT_DIR}/dev-stop.sh"
"${SCRIPT_DIR}/dev-start.sh"
log_success "Dev server restarted."
