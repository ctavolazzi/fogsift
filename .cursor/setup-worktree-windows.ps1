# APPROVED BY USER: worktree setup script
$ErrorActionPreference = 'Stop'

if (Test-Path "package-lock.json") {
  npm ci
} elseif (Test-Path "package.json") {
  npm install
}

if ($env:ROOT_WORKTREE_PATH -and (Test-Path "$env:ROOT_WORKTREE_PATH\.env")) {
  Copy-Item "$env:ROOT_WORKTREE_PATH\.env" .env
}

Write-Host "Worktree setup complete."
