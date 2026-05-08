#!/usr/bin/env bash
set -euo pipefail

COLOR_GREEN="\033[0;32m"
COLOR_YELLOW="\033[0;33m"
COLOR_RED="\033[0;31m"
COLOR_BLUE="\033[0;34m"
COLOR_RESET="\033[0m"

log_info() {
  printf "%b\n" "${COLOR_BLUE}[info]${COLOR_RESET} $*"
}

log_success() {
  printf "%b\n" "${COLOR_GREEN}[ok]${COLOR_RESET} $*"
}

log_warn() {
  printf "%b\n" "${COLOR_YELLOW}[warn]${COLOR_RESET} $*"
}

log_error() {
  printf "%b\n" "${COLOR_RED}[error]${COLOR_RESET} $*"
}

die() {
  log_error "$*"
  exit 1
}
