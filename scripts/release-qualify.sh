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

# Gate 4: AI Analysis Probe
# Only runs if fully configured
run_gate "gate4_ai_analysis" bash -lc '
# 1. Resolve Auth Token (Static or Ephemeral)
# We need this regardless of the provider
TOKEN="${OPSGUARD_TOKEN:-}"
if [ -z "$TOKEN" ]; then
    # Fetch from container if not in env
    if TOKEN=$(docker compose --profile tls exec -T app cat .opsguard_token 2>/dev/null); then
            TOKEN=$(echo "$TOKEN" | tr -d "[:space:]")
    fi
fi

# 2. Check Activation
ENABLED="${AI_ANALYSIS_ENABLED:-false}"
PROVIDER="${AI_PROVIDER:-gemini}"

if [ "$ENABLED" == "true" ] && [ -n "$TOKEN" ]; then
    echo "AI Enabled. Provider: $PROVIDER"

    # 3. Provider Specific Validation
    if [ "$PROVIDER" == "gemini" ] && [ -z "$GEMINI_API_KEY" ]; then
        echo "❌ FAILURE: Gemini selected but GEMINI_API_KEY is missing."
        exit 1
    fi
    
    if [ "$PROVIDER" == "ollama" ]; then
        echo "  -> Note: Running in Sovereignty Mode (Ollama)."
        echo "  -> (Ensure OLLAMA_URL is reachable from the container)"
    fi

    echo "Probing Endpoint..."
    sleep 2

    # 4. Make the Request
    # We allow a longer timeout (20s) for Ollama/Cold-start
    RESPONSE=$(curl -k -m 20 -s -w "\n%{http_code}" -X POST \
        -H "X-OpsGuard-Token: $TOKEN" \
        https://localhost/api/analyze)

    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed "\$d")

    if [ "$HTTP_CODE" == "200" ]; then
         # Check structure if jq is installed
        if command -v jq &> /dev/null; then
            IS_VALID=$(echo "$BODY" | jq ".ok == true and (.analysis.summary | type == \"string\")")
            if [ "$IS_VALID" == "true" ]; then
                echo "✅ AI Analysis Operational (Code 200 + Valid JSON)"
            else
                echo "❌ Invalid Response Structure"
                echo "$BODY"
                exit 1
            fi
        else
             echo "✅ AI Analysis Operational (Code 200) - jq missing, skipped structure check"
        fi
    else
        echo "❌ AI Gate Failed (Code $HTTP_CODE)"
        echo "Response: $BODY"
        if [ "$PROVIDER" == "ollama" ]; then
            echo "   (If using Ollama on E7270 without a GPU, a timeout might be expected.)"
        fi
        exit 1
    fi
else
    echo "⚠️  Skipping AI Gate (Disabled or Token missing)"
    if [ "$ENABLED" == "true" ] && [ -z "$TOKEN" ]; then
         echo "   (Detailed Reason: AI_ANALYSIS_ENABLED=true but Token could not be retrieved)"
    fi
fi
'

log ""
log "========================================"
log "RELEASE QUALIFIED. READY TO SHIP."
log "Logs saved to: ${RC_DIR}"
log "========================================"
exit 0
