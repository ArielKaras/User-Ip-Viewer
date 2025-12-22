#!/usr/bin/env bash
set -e

echo "🚀 Release Qualification Gate Initiated"
echo "========================================"

# Safety Interlock
if [[ "${1:-}" != "--force" ]]; then
    read -p "⚠️  WARNING: This will WIPE all local data and containers. Continue? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted by user."
        exit 1
    fi
fi

# Gate 0: Clean Build
echo "🏗️  [Gate 0] Clean Build & Determinism..."
docker compose down -v
docker build --no-cache -f Dockerfile.combined -t user-ip-viewer:release-candidate .

# Gate 1: Topology Verification
echo "🔌 [Gate 1] Spin up TLS Stack..."
docker compose --profile tls up -d --build

echo "⏳ Waiting 15s for stabilization..."
sleep 15

# Gate 2: Smoke Tests (Micro-Validation)
echo "🔍 [Gate 2] Running Smoke Tests..."
./scripts/smoke-test.sh

# Gate 3: Integration Tests (Deep Validation)
echo "🧪 [Gate 3] Running Integration Tests..."
./scripts/run-local-test.sh

echo "========================================"
echo "✅ RELEASE QUALIFIED. READY TO SHIP."
echo "========================================"
exit 0
