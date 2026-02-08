#!/bin/bash
# FogSift Session Startup Hook
# Runs bootstrap diagnostics, outputs context brief, and starts dev servers.
# Called automatically by Claude Code SessionStart hook.

set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}"

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
LOG_DIR="_tools/logs"
PID_DIR="_tools/pids"
mkdir -p "$LOG_DIR" "$PID_DIR"

TIMESTAMP=$(date +%Y-%m-%dT%H-%M-%S)
STARTUP_LOG="$LOG_DIR/startup-${TIMESTAMP}.log"

# Keep only the 10 most recent startup logs
ls -1t "$LOG_DIR"/startup-*.log 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------
log() {
  local msg="[$(date +%H:%M:%S)] $*"
  echo "$msg" >> "$STARTUP_LOG"
  echo "$msg"
}

log_quiet() {
  echo "[$(date +%H:%M:%S)] $*" >> "$STARTUP_LOG"
}

# ---------------------------------------------------------------------------
# Server management
# ---------------------------------------------------------------------------
check_port() {
  local port=$1
  lsof -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null
}

identify_port_owner() {
  local port=$1
  lsof -iTCP:"$port" -sTCP:LISTEN -P 2>/dev/null | tail -1 | awk '{print $1 " (pid " $2 ")"}'
}

start_server() {
  local port=$1
  local name=$2
  local pid_file="$PID_DIR/${name// /-}.pid"
  local log_file="$LOG_DIR/${name// /-}.log"
  shift 2

  # Check for stale PID file
  if [[ -f "$pid_file" ]]; then
    local old_pid
    old_pid=$(cat "$pid_file")
    if kill -0 "$old_pid" 2>/dev/null; then
      log "  [SKIP] $name (port $port) — already managed (pid $old_pid)"
      return 0
    else
      log_quiet "  Cleaned stale PID file for $name (pid $old_pid no longer running)"
      rm -f "$pid_file"
    fi
  fi

  # Check if port is occupied by something else
  local existing_pid
  existing_pid=$(check_port "$port")
  if [[ -n "$existing_pid" ]]; then
    local owner
    owner=$(identify_port_owner "$port")
    log "  [BUSY] $name (port $port) — occupied by $owner"
    log_quiet "  Port $port collision: wanted $name, found $owner"
    return 1
  fi

  # Verify the command/script exists before launching
  local cmd=$1
  if [[ "$cmd" == "node" && ! -f "$2" ]]; then
    log "  [MISS] $name — script not found: $2"
    return 1
  fi
  if [[ "$cmd" == "npx" ]]; then
    if ! command -v npx >/dev/null 2>&1; then
      log "  [MISS] $name — npx not found"
      return 1
    fi
  fi

  # Launch
  "$@" >> "$log_file" 2>&1 &
  local new_pid=$!
  echo "$new_pid" > "$pid_file"

  # Give it a moment and verify it didn't crash immediately
  sleep 0.3
  if kill -0 "$new_pid" 2>/dev/null; then
    log "  [ OK ] $name (port $port) — started (pid $new_pid)"
    log_quiet "  Server log: $log_file"
    return 0
  else
    log "  [FAIL] $name (port $port) — process exited immediately"
    log_quiet "  Check $log_file for details"
    rm -f "$pid_file"
    return 1
  fi
}

# ---------------------------------------------------------------------------
# 1. Diagnostics
# ---------------------------------------------------------------------------
echo "=== FogSift Session Startup ==="
log_quiet "Session startup at $TIMESTAMP"

node _tools/scripts/health-check.js 2>&1 || true
echo ""
node _tools/scripts/context-brief.js 2>&1 || true
echo ""
node _tools/scripts/project-snapshot.js 2>&1 | tail -3 || true
echo ""

# ---------------------------------------------------------------------------
# 1b. Session Reflection (auto-journal)
# ---------------------------------------------------------------------------
node _tools/scripts/session-reflect.js 2>&1 || true
echo ""

# ---------------------------------------------------------------------------
# 2. Dev servers
# ---------------------------------------------------------------------------
log "Starting dev servers..."

OK=0
FAILED=0

start_server 5050 "Dev-Server"        npx browser-sync start --server dist --port 5050 --no-open --no-ui && OK=$((OK+1)) || FAILED=$((FAILED+1))
start_server 5001 "AI-Journal"        node _AI_Journal/serve.js                                          && OK=$((OK+1)) || FAILED=$((FAILED+1))
start_server 5030 "Component-Library" node _tools/component-library/serve.js                              && OK=$((OK+1)) || FAILED=$((FAILED+1))
start_server 5065 "Test-Viewer"       node _tools/test-viewer/serve.js                                    && OK=$((OK+1)) || FAILED=$((FAILED+1))

echo ""
log "Servers: $OK ok, $FAILED failed"
log "Logs:    $LOG_DIR/"
log "PIDs:    $PID_DIR/"

echo ""
echo "=== Startup complete. Read _tools/snapshots/context-brief.md for full state. ==="
