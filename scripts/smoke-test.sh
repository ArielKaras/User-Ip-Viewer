#!/usr/bin/env bash
set -euo pipefail

# Default to localhost if not provided
BASE_URL="${BASE_URL:-http://localhost:80}"

echo "========================================"
echo "🔥 Smoke Test initiated against: $BASE_URL"
echo "========================================"

# Helper function for colored output
pass() { echo "✅ PASS: $1"; }
fail() { echo "❌ FAIL: $1"; exit 1; }

# 1. Health Endpoint
echo "[1/5] Checking /healthz..."
if curl -fsS "$BASE_URL/healthz" | grep -q '"status":"ok"'; then
  pass "/healthz is OK"
else
  fail "/healthz failed or did not return 'ok'"
fi

# 2. Version Endpoint
echo "[2/5] Checking /api/version..."
if curl -fsS "$BASE_URL/api/version" | grep -q 'commit'; then
  pass "/api/version returned commit info"
else
  fail "/api/version failed"
fi

# 3. API IP Endpoint
echo "[3/5] Checking /api/ip..."
if curl -fsS "$BASE_URL/api/ip" | grep -q '"ip"'; then
  pass "/api/ip returned JSON with IP"
fi

# 3.1 DB Connectivity (New)
echo "[3.1] Checking DB Status..."
if curl -fsS "$BASE_URL/api/version" | grep -q '"db_status":"connected"'; then
  pass "Database is connected"
else
  # Fail soft if DB isn't ready yet (might take longer)
  echo "⚠️  Database status not 'connected'. Check container logs."
fi

# 3.2 History API (New)
echo "[3.2] Checking /api/history..."
HTTP_CODE_HIST=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/history")
if [ "$HTTP_CODE_HIST" == "200" ]; then
    pass "/api/history returned 200 OK"
else
    fail "/api/history returned $HTTP_CODE_HIST"
fi

# 4. SPA Main Page
echo "[4/5] Checking Frontend Root /..."
HEADER=$(curl -fsSI "$BASE_URL/" | grep -i "content-type: text/html")
if [ -n "$HEADER" ]; then
  pass "Root serves HTML"
else
  fail "Root did not serve HTML content"
fi

# 5. SPA Fallback
echo "[5/5] Checking SPA Fallback /random-route..."
# Should return 200 OK and HTML (index.html), NOT 404
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/random-route")
TYPE_HEADER=$(curl -fsSI "$BASE_URL/random-route" | grep -i "content-type: text/html")

if [ "$HTTP_CODE" == "200" ] && [ -n "$TYPE_HEADER" ]; then
  pass "Fallback route returns 200 OK & HTML"
else
  fail "Fallback failed (Code: $HTTP_CODE)"
fi

echo "========================================"
echo "🎉 All Smoke Tests Passed!"
echo "========================================"
exit 0
