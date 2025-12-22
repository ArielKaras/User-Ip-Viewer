#!/bin/bash

# verify-opsguard.sh
# Automates the setup for comparing Local (OpsGuard) vs Cloud (Legacy) versions.

echo "🔍 Operations Guard Verification Suite"
echo "======================================"

# 1. Check/Start Local Version (OpsGuard)
echo ""
echo "hz Checking Local Environment (OpsGuard)..."
if docker compose ps | grep "Up"; then
    echo "✅ Local stack is running."
else
    echo "🔄 Starting Local Stack..."
    docker compose up -d --build
fi

# Wait for Local Nginx
echo "⏳ Waiting for Local Nginx (Port 443)..."
for i in {1..30}; do
    if curl -s -k -I https://localhost > /dev/null; then
        echo "✅ Local Environment Ready!"
        break
    fi
    sleep 1
done

# 2. Check/Start Cloud Version (Legacy)
CLOUD_PORT=8080
CLOUD_IMAGE="343253677111.dkr.ecr.eu-west-1.amazonaws.com/user-ip-viewer-combined:4c14357708722f69dc0c94b441ebf16f330ff1cd"

echo ""
echo "☁️  Checking Cloud Environment (Legacy)..."
if docker ps | grep ":$CLOUD_PORT->"; then
    echo "✅ Cloud Legacy container already running on port $CLOUD_PORT."
else
    echo "🚀 Starting Cloud Legacy container on port $CLOUD_PORT..."
    docker run -d --rm -p $CLOUD_PORT:3001 --name user-ip-viewer-legacy $CLOUD_IMAGE
fi

# 3. Summary
echo ""
echo "🎉 Verification Environment Ready!"
echo "=================================="
echo "1. 🆕 Local (OpsGuard):  https://localhost"
echo "   -> Has 'OpsGuard' dashboard. Logs, Metrics, Tracing."
echo ""
echo "2. 👴 Cloud (Legacy):    http://localhost:$CLOUD_PORT"
echo "   -> No visibility. Black box."
echo "=================================="
echo ""
echo "Use this setup to demonstrate the value of the new Observability layer."
