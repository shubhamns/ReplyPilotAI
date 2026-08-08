#!/usr/bin/env bash
set -euo pipefail
EXT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$EXT"
npm run build
OUT="$(cd "$EXT/.." && pwd)/replypilot-ai-extension.zip"
rm -f "$OUT"
(
  cd dist
  zip -r "$OUT" . -x "*.map" -x "*.DS_Store"
)
echo "Created $OUT"
