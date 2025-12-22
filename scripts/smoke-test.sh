#!/usr/bin/env bash
set -euo pipefail

# Default to localhost if not provided
BASE_URL="${BASE_URL:-https://localhost}"
APP_URL="${APP_URL:-http://localhost:3001}"

echo "========================================"
echo "🔥 Smoke Test (Read-Only) vs: $BASE_URL"
echo "========================================"

pass() { echo "✅ PASS: $1"; }
fail() { echo "❌ FAIL: $1"; exit 1; }

# Gate 1: Isolation Check
echo "[1/6] Checking Isolation..."
if curl -s --connect-timeout 2 "$APP_URL/healthz" >/dev/null; then
    fail "Port 3001 is OPEN! Isolation failed."
else
    pass "Port 3001 is correctly unreachable (Isolation OK)"
fi

# Gate 2: Public Ingress
echo "[2/6] Checking /healthz..."
if curl -kfsS "$BASE_URL/healthz" | grep -q '"status":"ok"'; then
  pass "/healthz is OK"
else
  fail "/healthz failed"
fi

echo "[3/6] Checking /api/version..."
if curl -kfsS "$BASE_URL/api/version" | grep -q 'commit'; then
  pass "/api/version returned commit info"
else
  fail "/api/version failed"
fi

echo "[4/6] Checking /api/ip..."
if curl -kfsS "$BASE_URL/api/ip" | grep -q '"ip"'; then
  pass "/api/ip returned JSON"
else
  fail "/api/ip failed"
fi

echo "[5/6] Checking /api/geo (Safe Fallback)..."
GEO_RES=$(curl -k -s "$BASE_URL/api/geo")
if echo "$GEO_RES" | grep -q '"ok":'; then
  pass "/api/geo structure valid via Nginx"
else
  echo "⚠️  WARN: /api/geo returned unexpected structure: $GEO_RES"
fi

# Gate 5: UI Load
echo "[6/6] Checking SPA Root..."
if curl -kfsSI "$BASE_URL/" | grep -i "content-type: text/html"; then
  pass "Root serves HTML"
else
  fail "Root did not serve HTML"
fi

exit 0
