#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 OPSGUARD: Resuming Development Environment..."
echo "📂 Working Directory: $PROJECT_ROOT"

# 1. Start Database & Backend (Docker)
if [ -f "docker-compose.yml" ]; then
    echo "🐳 Starting Docker containers..."
    docker-compose up -d
    echo "✅ Infrastructure is UP (DB, Backend, Grafana)."
else
    echo "⚠️  docker-compose.yml not found in $PROJECT_ROOT, skipping Docker start."
fi

# 2. Check for Docs dependencies
if [ -d "docs" ]; then
    echo "📘 Starting Documentation Server..."
    echo "   (Press Ctrl+C to stop the docs server)"
    cd docs
    npm run docs:dev
else
    echo "⚠️  docs/ directory not found in $PROJECT_ROOT."
fi
