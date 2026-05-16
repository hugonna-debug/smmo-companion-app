#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

bun install

if [[ -n "${CONVEX_DEPLOY_KEY:-}" && -n "${VITE_CONVEX_URL:-}" ]]; then
  echo "Convex secrets detected — configuring .env.local and running sync..."
  bun run env:setup
  bun run sync
else
  echo "Convex secrets not set (CONVEX_DEPLOY_KEY, VITE_CONVEX_URL)."
  echo "Add them in Cursor Dashboard → Cloud Agents → Secrets to enable sync and build."
fi
