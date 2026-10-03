#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PORT=4000
export MONGODB_URI="${MONGODB_URI:-mongodb://127.0.0.1:27017/specflow-e2e}"
export JWT_SECRET="${JWT_SECRET:-ci-access-secret-which-is-long-enough-32}"
export JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-ci-refresh-secret-which-is-long-enough-32}"
export FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:5173}"
export NODE_ENV=development
export VITE_API_URL=http://127.0.0.1:4000

cd "$ROOT/specflow-backend"
npm ci
npm run build
npm run seed
node dist/index.js &
API_PID=$!

cleanup() {
  kill "$API_PID" 2>/dev/null || true
}
trap cleanup EXIT

for _ in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:4000/health" >/dev/null; then
    break
  fi
  sleep 1
done
curl -sf "http://127.0.0.1:4000/health" >/dev/null

cd "$ROOT/specflow-frontend"
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
