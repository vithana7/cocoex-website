#!/usr/bin/env bash
# Start the local dev server for the cocoex website.
# This replaces "Open with Live Server" — the site is a Vite build and must be
# served through Vite, not opened as a raw file.
#
# Usage:  ./dev.sh
set -euo pipefail

cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Install Node.js first: https://nodejs.org (LTS)."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run only)…"
  npm install
fi

echo "Starting dev server — it will open in your browser automatically."
echo "Press Ctrl+C to stop."
npm run dev
