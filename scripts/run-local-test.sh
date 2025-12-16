#!/bin/bash
set -e

echo "🚀 Starting Full Verification (Local)..."

# 1. Clean Slate
echo "🧹 Cleaning up existing containers..."
docker compose down -v

# 2. Start Stack
echo "🏗️  Building and Starting Stack (TLS Profile)..."
docker compose --profile tls up -d --build

# 3. Wait for Health
echo "⏳ Waiting 15s for Database and App initialization..."
sleep 15

# 4. Run Smoke Tests
echo "🔍 Running Smoke Tests against HTTPS..."
export BASE_URL="https://localhost"
./scripts/smoke-test.sh

echo "✅ Full Verification Complete."
