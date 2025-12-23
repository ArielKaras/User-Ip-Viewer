#!/usr/bin/env bash
set -e

echo "🧹 OPSGUARD: Starting local cleanup..."

# 1. Stop Docker Services
if [ -f "docker-compose.yml" ]; then
    echo "🐳 Stopping Docker containers..."
    docker-compose down --remove-orphans
    echo "✅ Docker stopped."
else
    echo "⚠️  docker-compose.yml not found, skipping Docker shutdown."
fi

# 2. Kill Node.js Dev Servers (Docs, etc.)
# Specifically looking for processes running "vitepress" or "next" or listening on typical ports.
echo "🔪 Checking for lingering process..."

# Function to kill port
kill_port() {
    local PORT=$1
    if lsof -t -i :$PORT >/dev/null 2>&1; then
        echo "   - Killing process on port $PORT..."
        # Windows/Linux compatible way if possible, but assuming standard bash environment
        lsof -t -i :$PORT | xargs kill -9 2>/dev/null || true
    fi
}

kill_port 5173 # VitePress Default
kill_port 3000 # App Default
kill_port 8080 # Alt

# Also try to find npm run docs:dev matches
PIDS=$(ps aux | grep "npm run docs:dev" | grep -v grep | awk '{print $2}')
if [ ! -z "$PIDS" ]; then
   echo "   - Killing npm run docs:dev (PIDs: $PIDS)..."
   echo "$PIDS" | xargs kill -9 2>/dev/null || true
fi

echo "✨ All Clean! System is ready for a fresh start."
