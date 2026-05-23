#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/dev-test-ports.sh"
# shellcheck source=/dev/null
source "${SCRIPT_DIR}/dev-common.sh"

cleanup() {
  local exit_code=$?
  set +e
  bash "${SCRIPT_DIR}/dev-stop.sh" >/dev/null 2>&1 || true
  exit "${exit_code}"
}
trap cleanup EXIT

bash "${SCRIPT_DIR}/dev-stop.sh" >/dev/null 2>&1 || true
export DEV_BROWSER_OPEN=0
bash "${SCRIPT_DIR}/dev-start.sh"
wait_for_url "${BASE_URL}" "${HEALTH_TIMEOUT_SECONDS}" "${HEALTH_INTERVAL_SECONDS}"

if [[ "$#" -gt 0 ]]; then
  "$@"
fi
