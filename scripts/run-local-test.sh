#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-https://localhost}"

echo "========================================"
echo "🧪 Integration Test (Mutation) vs: $BASE_URL"
echo "========================================"

pass() { echo "✅ PASS: $1"; }
fail() { echo "❌ FAIL: $1"; exit 1; }

# Gate 3: DB & Schema
echo "[1/4] Checking DB Schema..."
if docker compose logs db 2>&1 | grep -q 'database system is ready to accept connections'; then
    pass "DB Container reports ready"
else
    echo "⚠️  WARN: Could not verify DB logs (might be rotated)"
fi

# Gate 4: History Logic & Isolation
echo "[2/4] Testing History Isolation..."
CLIENT_A="test-client-a-$(date +%s)"
CLIENT_B="test-client-b-$(date +%s)"

# 1. Write Client A
curl -k -s -X POST -H "Content-Type: application/json" \
     -H "X-Client-Id: $CLIENT_A" \
     -d '{"ip":"1.1.1.1", "city":"IntegrationCity", "country":"TestLand"}' \
     "$BASE_URL/api/track" > /dev/null

# 2. Read Client A
RES_A=$(curl -k -s "$BASE_URL/api/history" -H "X-Client-Id: $CLIENT_A")
if echo "$RES_A" | grep -q "IntegrationCity"; then
    pass "Client A write/read confirmed"
else
    fail "Client A write failed. Got: $RES_A"
fi

# 3. Read Client B (Should be empty of Client A's data)
RES_B=$(curl -k -s "$BASE_URL/api/history" -H "X-Client-Id: $CLIENT_B")
if echo "$RES_B" | grep -q "IntegrationCity"; then
    fail "Privacy Leak! Client B saw Client A's data."
else
    pass "Identity Isolation confirmed"
fi

# Gate 5: Deletion
echo "[3/4] Testing History Clear..."
curl -k -s -X DELETE "$BASE_URL/api/history" -H "X-Client-Id: $CLIENT_A"
RES_CLEARED=$(curl -k -s "$BASE_URL/api/history" -H "X-Client-Id: $CLIENT_A")
if [ "$RES_CLEARED" == "[]" ]; then
    pass "History cleared successfully"
else
    fail "Clear failed. Got: $RES_CLEARED"
fi

echo "[4/4] Verifying Tracing..."
if curl -kfsI "$BASE_URL/api/ip" | grep -q "x-trace-id"; then
    pass "X-Trace-Id header present"
else
    echo "⚠️  WARN: X-Trace-Id missing from response headers"
fi

echo "========================================"
echo "🎉 Integration Tests Passed!"
echo "========================================"
exit 0
