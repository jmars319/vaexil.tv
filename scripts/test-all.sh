#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

npm run test:static
npm run test:unit
npm run test:deploy
npm run test:e2e
npm run verify

echo "[test:all] All checks passed"
