#!/bin/bash
# FogSift Session Startup Hook
# Runs bootstrap diagnostics and outputs context brief for Claude.
# Called automatically by Claude Code SessionStart hook.

set -euo pipefail
cd "${CLAUDE_PROJECT_DIR:-.}"

echo "=== FogSift Session Startup ==="

# 1. Health check (fast pass/fail)
node _tools/scripts/health-check.js 2>&1 || true

echo ""

# 2. Context brief (concise state summary — also writes to _tools/snapshots/context-brief.md)
node _tools/scripts/context-brief.js 2>&1 || true

echo ""

# 3. Snapshot (writes JSON to _tools/snapshots/latest.json, minimal stdout)
node _tools/scripts/project-snapshot.js 2>&1 | tail -3 || true

echo ""
echo "=== Startup complete. Read _tools/snapshots/context-brief.md for full state. ==="
