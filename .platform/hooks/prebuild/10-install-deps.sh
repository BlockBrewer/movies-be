#!/bin/bash
set -euo pipefail

echo "[EB Hook] Installing pnpm dependencies"

export SKIP_PNPM_ENFORCEMENT=true
export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

if ! command -v corepack >/dev/null 2>&1; then
  echo "[EB Hook] corepack not found, installing via npm"
  npm install -g corepack
fi

corepack enable
corepack prepare pnpm@10 --activate

pnpm install --prod --frozen-lockfile

