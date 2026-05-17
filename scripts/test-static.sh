#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[test:static] Checking shell script syntax"
while IFS= read -r -d '' file; do
  bash -n "$file"
done < <(find "$ROOT_DIR/scripts" -type f -name '*.sh' -print0)

echo "[test:static] Checking Node script syntax"
while IFS= read -r -d '' file; do
  node --check "$file"
done < <(find "$ROOT_DIR/scripts" -type f \( -name '*.js' -o -name '*.mjs' -o -name '*.cjs' \) -print0)

npm run lint
npm run typecheck

echo "[test:static] Static checks passed"
