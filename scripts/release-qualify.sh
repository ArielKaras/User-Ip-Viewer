#!/usr/bin/env bash
set -euo pipefail

# Always run from repo root
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
cd "$REPO_ROOT"

RC_DIR="${REPO_ROOT}/.release-qualify"
mkdir -p "$RC_DIR"

log() { printf "%s\n" "$*"; }
fail() { log "ERROR: $*"; exit 1; }

cleanup() {
  # Keep logs for debugging; tear down containers to avoid drift
  docker compose --profile tls down >/dev/null 2>&1 || true
}
trap cleanup EXIT

log "Release Qualification Gate Initiated"
log "========================================"

# Safety interlock
if [[ "${1:-}" != "--force" ]]; then
  read -r -p "WARNING: This will WIPE all local data/volumes. Continue? [y/N] " REPLY
  if [[ ! "$REPLY" =~ ^[Yy]$ ]]; then
    fail "Aborted by user."
  fi
fi

run_gate() {
  local name="$1"
  shift
  log ""
  log "[${name}]"
  log "----------------------------------------"
  "$@" 2>&1 | tee "${RC_DIR}/${name}.log"
}

wait_for_https() {
  local url="${1}"
  local max_attempts="${2:-40}"
  local sleep_s="${3:-1}"

  for ((i=1; i<=max_attempts; i++)); do
    if curl -kfsS --max-time 2 "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$sleep_s"
  done
  return 1
}

# Gate 0: Clean Build & determinism
run_gate "gate0_clean" bash -lc '
  docker compose down -v
  docker build --no-cache -f Dockerfile.combined -t user-ip-viewer:release-candidate .
'

# Gate 1: Spin up TLS stack
run_gate "gate1_up" bash -lc '
  docker compose --profile tls up -d --build
'

log ""
log "[gate1_wait_ready]"
log "----------------------------------------"
if ! wait_for_https "https://localhost/healthz" 60 1; then
  docker compose --profile tls logs --no-color > "${RC_DIR}/compose.log" 2>&1 || true
  fail "App did not become ready on https://localhost/healthz. See ${RC_DIR}/compose.log"
fi
log "OK: https://localhost/healthz is responding"

# Gate 2: Smoke tests (read-only)
run_gate "gate2_smoke" bash -lc '
  bash ./scripts/smoke-test.sh
'

# Gate 3: Integration tests (DB writes/reads)
run_gate "gate3_integration" bash -lc '
  bash ./scripts/run-local-test.sh
'

log ""
log "========================================"
log "RELEASE QUALIFIED. READY TO SHIP."
log "Logs saved to: ${RC_DIR}"
log "========================================"
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
