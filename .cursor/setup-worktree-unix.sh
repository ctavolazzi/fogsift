#!/bin/bash
# APPROVED BY USER: worktree setup script
set -e

if [ -f "package-lock.json" ]; then
  npm ci
elif [ -f "package.json" ]; then
  npm install
fi

if [ -n "${ROOT_WORKTREE_PATH:-}" ] && [ -f "$ROOT_WORKTREE_PATH/.env" ]; then
  cp "$ROOT_WORKTREE_PATH/.env" .env
fi

echo "Worktree setup complete."
